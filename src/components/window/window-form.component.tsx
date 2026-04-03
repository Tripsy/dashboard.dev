'use client';

import React, {
	cloneElement,
	isValidElement,
	useActionState,
	useCallback,
	useEffect,
	useMemo,
} from 'react';
import { FormComponentSubmit } from '@/components/form/form-element.component';
import { FormError } from '@/components/form/form-error.component';
import { getActionIcon, Icons } from '@/components/icon.component';
import {
	type BaseModelType,
	type DataSourceKey,
	hasSyncFormState,
	hasValidateForm,
} from '@/config/data-source.config';
import { createHandleChange, processForm } from '@/helpers/form.helper';
import { useFormValidation } from '@/hooks/use-form-validation.hook';
import { useFormValues } from '@/hooks/use-form-values.hook';
import type { ApiResponseFetch } from '@/types/api.type';
import type {
	FormStateType,
	FormValuesType,
	ValidateFormFnType,
	ValidateFormReturnType,
} from '@/types/form.type';
import type { ActionButtonPropsType } from '@/types/html.type';

type WindowFormType<FormValues extends FormValuesType, FormOperation> = {
	uid: string;
	formOperation: FormOperation;
	formSubmitButton?: ActionButtonPropsType;
	getFormValues: (formData: FormData) => FormValues;
	validateForm: ValidateFormFnType<FormValues>;
	fetchFunction: (data: FormValues) => Promise<ApiResponseFetch<unknown>>;
	// dataSource: K;
	// actionEntry: Model | null;
	// prefillEntry?: Record<string, unknown>;
	children: React.ReactElement<unknown>;
};

export function WindowForm<FormValues extends FormValuesType>({
	uid,
	formOperation,
	formSubmitButton,
	// getFormValues,
	// validateForm,
	// fetchFunction,
	children,
}: WindowFormType<FormValues, string>) {
	// const { showToast } = useToast();
	// const refreshDataTable = useRefreshDataTable();

	// // Derive data via hooks/memos — no guards yet
	// const formState = useMemo(
	// 	() => getDataSourceConfig(dataSource, 'formState'),
	// 	[dataSource],
	// );
	// const functions = useMemo(
	// 	() => getDataSourceConfig(dataSource, 'functions'),
	// 	[dataSource],
	// );
	// const actions = useMemo(
	// 	() => getDataSourceConfig(dataSource, 'actions'),
	// 	[dataSource],
	// );

	// const initState = useMemo(() => {
	// 	if (!formState) {
	// 		throw new ValueError(
	// 			`'formState' is not defined for ${dataSource}`,
	// 		);
	// 	}
	//
	// 	if (formAction === 'update' && actionEntry && hasSyncFormState(functions)) {
	// 		return functions.syncFormState(formState, actionEntry);
	// 	}
	//
	// 	if (formAction === 'create' && prefillEntry && hasSyncFormState(functions)) {
	// 		return functions.syncFormState(formState, prefillEntry as BaseModelType);
	// 	}
	//
	// 	return formState;
	// }, [formState, functions, formAction, actionEntry, dataSource, prefillEntry]);

	const [state, action, pending] = useActionState<
		FormStateType<FormValues>,
		FormData
	>(
		async (state, formData) =>
			processForm(
				state,
				formData,
				getFormValues,
				validateForm,
				fetchFunction,
			),
		initState as unknown as FormStateType<FormValues>,
	);

	const [formValues, setFormValues] = useFormValues<FormValues>(state.values);

	const validate = useCallback(
		(values: FormValues): ValidateFormReturnType<FormValues> => {
			if (!hasValidateForm<FormValues>(functions)) {
				return {} as ValidateFormReturnType<FormValues>;
			}

			return functions.validateForm(values, state?.id);
		},
		[state?.id, functions],
	);

	const { errors, submitted, markSubmit, markFieldAsTouched } =
		useFormValidation({ formValues, validate, debounceDelay: 800 });

	// const actionLabelKey = `${dataSource}.action.${formAction}.label`;
	// const successMessageKey = `${dataSource}.action.${formAction}.success`;
	//
	// const translationsKeys = useMemo(
	// 	() =>
	// 		[
	// 			successMessageKey,
	// 			actionLabelKey,
	// 			'app.text.success_title',
	// 			'app.text.saving',
	// 		] as const,
	// 	[actionLabelKey, successMessageKey],
	// );
	//
	// const { translations } = useTranslation(translationsKeys);

	// const onSuccess = useCallback(
	// 	async (actionName: string, resultData?: unknown) => {
	// 		if (actionName === 'create') {
	// 			handleReset(dataSource); // Reset data-table filters form
	// 		}
	//
	// 		await refreshDataTable(dataSource);
	//
	// 		showToast({
	// 			severity: 'success',
	// 			summary: translations['app.text.success_title'],
	// 			detail: translations[successMessageKey],
	// 		});
	//
	// 		close();
	//
	// 		if (onSuccessAction) {
	// 			onSuccessAction(resultData);
	// 		}
	// 	},
	// 	[
	// 		onSuccessAction,
	// 		dataSource,
	// 		refreshDataTable,
	// 		showToast,
	// 		close,
	// 		translations,
	// 		successMessageKey,
	// 	],
	// );
	//
	// useEffect(() => {
	// 	if (state.situation === 'success') {
	// 		onSuccess(actionName, state.resultData).catch((error) => {
	// 			showToast({
	// 				severity: 'error',
	// 				summary: 'Error',
	// 				detail: error.message,
	// 			});
	// 		});
	// 	}
	// }, [state.situation, onSuccess, actionName, showToast]);

	// // Guards
	// if (!formState) {
	// 	throw new ValueError(`'formState' is not defined for ${dataSource}`);
	// }
	//
	// if (
	// 	!('syncFormState' in functions) ||
	// 	typeof functions.syncFormState !== 'function'
	// ) {
	// 	throw new ValueError(
	// 		`'syncFormState' function is not defined for ${dataSource}`,
	// 	);
	// }
	//
	// if (
	// 	!('validateForm' in functions) ||
	// 	typeof functions.validateForm !== 'function'
	// ) {
	// 	throw new ValueError(
	// 		`'validateForm' function is not defined for ${dataSource}`,
	// 	);
	// }
	//
	// if (!actions) {
	// 	throw new ValueError(`Actions must be defined for ${dataSource}`);
	// }

	const handleChange = createHandleChange<FormValues>(
		setFormValues,
		markFieldAsTouched,
	);

	const injectedChild = isValidElement(children)
		? cloneElement(
				children as React.ReactElement<FormComponentType<FormValues>>,
				{
					formOperation,
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
						variant: formSubmitButton?.variant || 'info',
						label: formSubmitButton?.label || 'Submit',
						icon: getActionIcon(formSubmitButton?.icon || 'submit'),
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
