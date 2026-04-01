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
import { FormComponentSubmit } from '@/components/form/form-element.component';
import { FormError } from '@/components/form/form-error.component';
import { getActionIcon, Icons } from '@/components/icon.component';
import {
	type BaseModelType,
	type DataSourceKey,
	type FormManageType, FormStateType, FormValuesType,
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

type WindowFormType = {
	uid: string;
	formType: 'create' | 'update';
	// dataSource: K;
	// actionName: 'create' | 'update';
	// actionEntry: Model | null;
	// prefillEntry?: Record<string, unknown>;
	children: React.ReactElement<unknown>;
}

export function WindowForm<
	K extends DataSourceKey,
	Model extends BaseModelType,
	FormValues extends FormValuesType,
>({
	uid,
	formType,
	children,
}: WindowFormType) {
	const { showToast } = useToast();
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

		if (formType === 'update' && actionEntry && hasSyncFormState(functions)) {
			return functions.syncFormState(formState, actionEntry);
		}

		if (formType === 'create' && prefillEntry && hasSyncFormState(functions)) {
			return functions.syncFormState(formState, prefillEntry as BaseModelType);
		}

		return formState;
	}, [formState, functions, formType, actionEntry, dataSource, prefillEntry]);

	const [state, action, pending] = useActionState<FormStateType<K, Model, FormValues>, FormData>(
		async (state, formData) => formAction(state, formData),
		initState as unknown as FormStateType<K, Model, FormValues>,
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

	const actionLabelKey = `${dataSource}.action.${formType}.label`;
	const successMessageKey = `${dataSource}.action.${formType}.success`;

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
		async (actionName: string, resultData?: unknown) => {
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

			if (onSuccessAction) {
				onSuccessAction(resultData);
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
			onSuccess(actionName, state.resultData).catch((error) => {
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
			key={`form-${uid}`}
			action={action}
			onSubmit={markSubmit}
			className="form-section"
		>
			{injectedChild}

			<div className="flex justify-end gap-3">
				<FormComponentSubmit
					pending={pending}
					submitted={submitted}
					errors={errors as Record<string, string[]>} // remove `as`
					button={{
						variant:
							actions[actionName]?.buttonProps?.variant || 'info',
						label: translations[actionLabelKey],
						icon: getActionIcon(
							actions[actionName]?.buttonProps?.icon || actionName,
						),
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
