'use client';

import React, {
	cloneElement,
	isValidElement,
	useActionState,
	useCallback,
	useEffect,
	useMemo,
} from 'react';
import { useStore } from 'zustand/react';
import { formAction } from '@/app/(dashboard)/_actions';
import { handleReset } from '@/app/(dashboard)/_components/data-table-actions.component';
import { useDataTable } from '@/app/(dashboard)/_providers/data-table-provider';
import { FormComponentSubmit } from '@/components/form/form-element.component';
import { FormError } from '@/components/form/form-error.component';
import { getActionIcon, Icons } from '@/components/icon.component';
import {
	type DataSourceKey,
	type FormManageType,
	type FormStateType,
	type FormStateValuesType,
	getDataSourceConfig,
	type ValidateSyncFormStateFunctionType,
} from '@/config/data-source.config';
import ValueError from '@/exceptions/value.error';
import { createHandleChange } from '@/helpers/form.helper';
import {
	useFormValidation,
	type ValidateFormFunctionType,
} from '@/hooks/use-form-validation.hook';
import { useFormValues } from '@/hooks/use-form-values.hook';
import { useTranslation } from '@/hooks/use-translation.hook';
import { useToast } from '@/providers/toast.provider';

export function FormManage<
	K extends DataSourceKey,
	Model,
	FormValues extends FormStateValuesType,
>({ children }: { children: React.ReactNode }) {
	const { dataSource, dataTableStore } = useDataTable<K, Model>();
	const { showToast } = useToast();

	const actions = useMemo(
		() =>
			getDataSourceConfig<K, Model, FormValues, 'actions'>(
				dataSource,
				'actions',
			),
		[dataSource],
	);

	if (!actions) {
		throw new ValueError(`'actions' are not defined for ${dataSource}`);
	}

	const actionName = useStore(dataTableStore, (state) => state.actionName);

	if (!actionName) {
		throw new Error('actionName appears to be null');
	}

	const actionEntry = useStore(dataTableStore, (state) => state.actionEntry);
	const closeOut = useStore(dataTableStore, (state) => state.closeOut);
	const refreshTableState = useStore(
		dataTableStore,
		(state) => state.refreshTableState,
	);

	const formState = getDataSourceConfig<K, Model, FormValues, 'formState'>(
		dataSource,
		'formState',
	);

	if (!formState) {
		throw new ValueError(`'formState' is not defined for ${dataSource}`);
	}

	const functions = getDataSourceConfig<K, Model, FormValues, 'functions'>(
		dataSource,
		'functions',
	);

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

	const initState =
		actionName === 'update' && actionEntry
			? (
					functions.syncFormState as ValidateSyncFormStateFunctionType<
						K,
						Model,
						FormValues
					>
				)(formState, actionEntry)
			: formState;

	const [state, action, pending] = useActionState<
		FormStateType<K, Model, FormValues>,
		FormData
	>(
		async (
			state: FormStateType<K, Model, FormValues>,
			formData: FormData,
		) => formAction(state, formData),
		initState as Awaited<FormStateType<K, Model, FormValues>>,
	);

	const [formValues, setFormValues] = useFormValues<FormValues>(state.values);

	const validate = useCallback(
		(values: FormValues) => {
			return (
				functions.validateForm as ValidateFormFunctionType<FormValues>
			)(values, state.id);
		},
		[state.id, functions.validateForm],
	);

	const { errors, submitted, markSubmit, markFieldAsTouched } =
		useFormValidation({
			formValues,
			validate,
			debounceDelay: 800,
		});

	const handleChange = createHandleChange(setFormValues, markFieldAsTouched);

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

	// Handle success state
	useEffect(() => {
		if (state.situation === 'success') {
			if (state?.resultData) {
				if (actionName === 'create') {
					handleReset('FormManage'); // Reset the form
					refreshTableState(); // Force data reload to show the new item
				} else {
					refreshTableState();
				}
			}

			showToast({
				severity: 'success',
				summary: translations['app.text.success_title'],
				detail: translations[successMessageKey],
			});

			closeOut();
		}
	}, [
		state.situation,
		showToast,
		closeOut,
		actionName,
		state?.resultData,
		refreshTableState,
		translations,
		successMessageKey,
	]);

	const ActionButtonIcon = getActionIcon(actionName);

	const injectedChild = isValidElement(children)
		? cloneElement(children, {
				actionName,
				formValues,
				errors,
				handleChange,
				pending,
			} as FormManageType<FormValues>)
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
							actions[actionName as keyof typeof actions]
								?.buttonProps?.variant || 'info',
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
