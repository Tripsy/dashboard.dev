'use client';

import type React from 'react';
import {
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
import { FormError } from '@/components/form/form-error.component';
import { getActionIcon, Icons } from '@/components/icon.component';
import { LoadingIcon } from '@/components/status.component';
import {
	type DataSourceKey,
	type FormManageType,
	type FormStateType,
	type FormStateValuesType,
	getDataSourceConfig,
	type ValidateSyncFormStateFunctionType,
} from '@/config/data-source.config';
import ValueError from '@/exceptions/value.error';
import { setObjectValue } from '@/helpers/objects.helper';
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

	const actionName = useStore(dataTableStore, (state) => state.actionName);
	const actionEntry = useStore(dataTableStore, (state) => state.actionEntry);
	const closeOut = useStore(dataTableStore, (state) => state.closeOut);
	const refreshTableState = useStore(
		dataTableStore,
		(state) => state.refreshTableState,
	);

	if (!actionName) {
		throw new Error('actionName appears to be null');
	}

	const formState = getDataSourceConfig<K, Model, FormValues, 'formState'>(
		dataSource,
		'formState',
	);

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
		useFormValidation<FormValues>({
			formValues,
			validate,
			debounceDelay: 800,
		});

	const handleChange = (
		name: string, // eg: content OR content[subject] OR content.subject
		value: string | boolean | number | Date,
	) => {
		setFormValues((prev) => {
			// Convert bracket notation to dot notation: content[subject] -> content.subject
			const dotNotationPath = name.replace(/\[(\w+)]/g, '.$1');

			// Create a deep clone to avoid mutating the previous state
			const newValues = JSON.parse(JSON.stringify(prev));

			// Use your existing function to set the nested value
			setObjectValue(newValues, dotNotationPath, value);

			return newValues;
		});

		markFieldAsTouched(name as keyof FormValues);
	};

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

			<FormPart>
				<div className="flex justify-end gap-3">
					<button
						type="submit"
						className="btn btn-info"
						disabled={
							pending ||
							(submitted && Object.keys(errors).length > 0)
						}
						aria-busy={pending}
					>
						{pending ? (
							<span className="flex items-center gap-1.5">
								<LoadingIcon />
								{translations['app.text.saving']}
							</span>
						) : submitted && Object.keys(errors).length > 0 ? (
							<span className="flex items-center gap-1.5">
								<Icons.Status.Error className="animate-pulse" />
								{translations[actionLabelKey]}
							</span>
						) : (
							<span className="flex items-center gap-1.5">
								<ActionButtonIcon />
								{translations[actionLabelKey]}
							</span>
						)}
					</button>
				</div>
			</FormPart>

			{state.situation === 'error' && state.message && (
				<FormError>
					<div>
						<Icons.Status.Error /> {state.message}
					</div>
				</FormError>
			)}
		</form>
	);
}
