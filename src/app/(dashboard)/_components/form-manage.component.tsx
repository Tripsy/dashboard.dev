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
} from '@/config/data-source.config';
import ValueError from '@/exceptions/value.error';
import { createHandleChange } from '@/helpers/form.helper';
import { useFormValidation } from '@/hooks/use-form-validation.hook';
import { useFormValues } from '@/hooks/use-form-values.hook';
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

	// const closeOut = useStore(dataTableStore, (state) => state.closeOut);
	// const refreshTableState = useStore(
	// 	dataTableStore,
	// 	(state) => state.refreshTableState,
	// );

	const formState = getDataSourceConfig(dataSource, 'formState');

	if (!formState) {
		throw new ValueError(`'formState' is not defined for ${dataSource}`);
	}

	const functions = getDataSourceConfig(dataSource, 'functions');

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

	const actions = useMemo(
		() => getDataSourceConfig(dataSource, 'actions'),
		[dataSource],
	);

	if (!actions) {
		throw new Error(`Actions must be defined for ${dataSource}`);
	}

	const initState =
		actionName === 'update' && actionEntry
			? functions.syncFormState(formState, actionEntry)
			: formState;

	type FormStateType = Awaited<typeof initState>;
	type FormValues = typeof initState.values;

	const [state, action, pending] = useActionState<FormStateType, FormData>(
		async (state: FormStateType, formData: FormData) =>
			formAction(state, formData),
		initState,
	);

	const [formValues, setFormValues] = useFormValues<FormValues>(state.values);

	const validate = useCallback(
		(values: FormValues) => {
			return functions.validateForm(values, state.id);
		},
		[state.id, functions],
	);

	const { errors, submitted, markSubmit, markFieldAsTouched } =
		useFormValidation<FormValues>({
			formValues,
			validate,
			debounceDelay: 800,
		});

	const handleChange = createHandleChange<FormValues>(
		setFormValues,
		markFieldAsTouched,
	);

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

	const onSuccess = (actionName: string) => {
		if (onSuccessAction) {
			onSuccessAction(actionName);
		} else {
			// Default success action
			if (actionName === 'create') {
				// Reset filters form
				handleReset(dataSource);
				// TODO
				// refreshTableState(); // Force data reload to show the new item
			} else {
				// TODO
				// refreshTableState();
			}

			showToast({
				severity: 'success',
				summary: translations['app.text.success_title'],
				detail: translations[successMessageKey],
			});

			close();
		}
	};

	// Handle success state
	useEffect(() => {
		if (state.situation === 'success') {
			onSuccess(actionName);
		}
	}, [state.situation, onSuccess, actionName]);

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
