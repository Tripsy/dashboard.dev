'use client';

import React, {
	cloneElement,
	isValidElement,
	useActionState,
	useCallback,
	useEffect,
	useMemo,
} from 'react';
import { formAction } from '@/app/(dashboard)/_actions';
import { handleReset } from '@/app/(dashboard)/_components/form-filters.component';
import {
	type ModalOnSuccess,
	useModalStore,
} from '@/app/(dashboard)/_stores/modal.store';
import { FormComponentSubmit } from '@/components/form/form-element.component';
import { FormError } from '@/components/form/form-error.component';
import { getActionIcon, Icons } from '@/components/icon.component';
import {
	type BaseModelType,
	type DataSourceKey,
	type FormManageType,
	getDataSourceConfig,
	hasSyncFormState,
	hasValidateForm,
} from '@/config/data-source.config';
import ValueError from '@/exceptions/value.error';
import { createHandleChange } from '@/helpers/form.helper';
import {
	useFormValidation,
	type ValidationReturnType,
} from '@/hooks/use-form-validation.hook';
import { useFormValues } from '@/hooks/use-form-values.hook';
import { useRefreshDataTable } from '@/hooks/use-refresh-data-table.hook';
import { useTranslation } from '@/hooks/use-translation.hook';
import { useToast } from '@/providers/toast.provider';

export function FormManage<K extends DataSourceKey>({
	dataSource,
	actionName,
	actionEntry,
	onSuccessAction,
	children,
}: {
	dataSource: K;
	actionName: 'create' | 'update';
	actionEntry: BaseModelType | null;
	onSuccessAction?: ModalOnSuccess;
	children: React.ReactElement<unknown>;
}) {
	const { showToast } = useToast();
	const { close } = useModalStore();
	const refreshDataTable = useRefreshDataTable();

	// Derive data via hooks/memos — no guards yet
	const formState = useMemo(
		() => getDataSourceConfig(dataSource, 'formState'),
		[dataSource],
	);
	const functions = useMemo(
		() => getDataSourceConfig(dataSource, 'functions'),
		[dataSource],
	);
	const actions = useMemo(
		() => getDataSourceConfig(dataSource, 'actions'),
		[dataSource],
	);

	const initState = useMemo(() => {
		if (!formState) {
			throw new ValueError(
				`'formState' is not defined for ${dataSource}`,
			);
		}

		if (
			actionName === 'update' &&
			actionEntry &&
			hasSyncFormState(functions)
		) {
			return functions.syncFormState(formState, actionEntry);
		}

		return formState;
	}, [formState, functions, actionName, actionEntry, dataSource]);

	type FormStateType = Awaited<typeof initState>;
	type FormValues = typeof initState.values;

	const [state, action, pending] = useActionState<FormStateType, FormData>(
		async (state, formData) => formAction(state, formData),
		initState ?? ({} as FormStateType),
	);

	const [formValues, setFormValues] = useFormValues<FormValues>(state.values);

	const validate = useCallback(
		(values: FormValues): ValidationReturnType<FormValues> => {
			if (!hasValidateForm<FormValues>(functions)) {
				return {} as ValidationReturnType<FormValues>;
			}

			return functions.validateForm(values, state?.id);
		},
		[state?.id, functions],
	);

	const { errors, submitted, markSubmit, markFieldAsTouched } =
		useFormValidation({ formValues, validate, debounceDelay: 800 });

	const actionLabelKey = `${dataSource}.action.${actionName}.label`;
	const successMessageKey = `${dataSource}.action.${actionName}.success`;

	const translationsKeys = useMemo(
		() =>
			[
				successMessageKey,
				actionLabelKey,
				'app.text.success_title',
				'app.text.saving',
			] as const,
		[actionLabelKey, successMessageKey],
	);

	const { translations } = useTranslation(translationsKeys);

	const onSuccess = useCallback(
		async (actionName: string) => {
			if (onSuccessAction) {
				onSuccessAction(actionName);
			} else {
				if (actionName === 'create') {
					handleReset(dataSource); // Reset data-table filters form
				}

				await refreshDataTable(dataSource);

				showToast({
					severity: 'success',
					summary: translations['app.text.success_title'],
					detail: translations[successMessageKey],
				});

				close();
			}
		},
		[
			onSuccessAction,
			dataSource,
			refreshDataTable,
			showToast,
			close,
			translations,
			successMessageKey,
		],
	);

	useEffect(() => {
		if (state.situation === 'success') {
			onSuccess(actionName).catch((error) => {
				showToast({
					severity: 'error',
					summary: 'Error',
					detail: error.message,
				});
			});
		}
	}, [state.situation, onSuccess, actionName, showToast]);

	// Guards
	if (!formState) {
		throw new ValueError(`'formState' is not defined for ${dataSource}`);
	}

	if (
		!('syncFormState' in functions) ||
		typeof functions.syncFormState !== 'function'
	) {
		throw new ValueError(
			`'syncFormState' function is not defined for ${dataSource}`,
		);
	}

	if (
		!('validateForm' in functions) ||
		typeof functions.validateForm !== 'function'
	) {
		throw new ValueError(
			`'validateForm' function is not defined for ${dataSource}`,
		);
	}

	if (!actions) {
		throw new ValueError(`Actions must be defined for ${dataSource}`);
	}

	const handleChange = createHandleChange<FormValues>(
		setFormValues,
		markFieldAsTouched,
	);
	const ActionButtonIcon = getActionIcon(
		actions[actionName]?.buttonProps?.icon || actionName,
	);

	const injectedChild = isValidElement(children)
		? cloneElement(
				children as React.ReactElement<FormManageType<FormValues>>,
				{
					actionName,
					formValues,
					errors,
					handleChange,
					pending,
				},
			)
		: children;

	return (
		<form
			key={`form-${actionName}`}
			action={action}
			onSubmit={markSubmit}
			className="form-section"
		>
			{injectedChild}

			<div className="flex justify-end gap-3">
				<FormComponentSubmit
					pending={pending}
					submitted={submitted}
					errors={errors as Record<string, string[]>}
					button={{
						variant:
							actions[actionName]?.buttonProps?.variant || 'info',
						label: translations[actionLabelKey],
						icon: ActionButtonIcon,
					}}
				/>
			</div>

			{state.situation === 'error' && state.message && (
				<FormError>
					<React.Fragment key="error-content">
						<Icons.Status.Error />
						<div>{state.message}</div>
					</React.Fragment>
				</FormError>
			)}
		</form>
	);
}
