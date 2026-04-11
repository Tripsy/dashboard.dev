'use client';

import React, { useActionState } from 'react';
import { FormComponentSubmit } from '@/components/form/form-element.component';
import { FormError } from '@/components/form/form-error.component';
import { getActionIcon, Icons } from '@/components/icon.component';
import { createHandleChange, processForm } from '@/helpers/form.helper';
import { useWindowFormProcessed } from '@/hooks/use-form-processed.hook';
import { useFormValidation } from '@/hooks/use-form-validation.hook';
import { useFormValues } from '@/hooks/use-form-values.hook';
import { WindowFormProvider } from '@/providers/window-form.provider';
import { useModalStore } from '@/stores/window.store';
import type { FormOperationFunctionType } from '@/types/action.type';
import type { FormStateType, FormValuesType } from '@/types/form.type';
import type { WindowConfig, WindowEntryType } from '@/types/window.type';

type WindowFormType<WindowEntry> = {
	uid: string;
	entry?: WindowEntry;
	children: React.ReactElement<unknown>;
};

export function WindowForm<
	FormValues extends FormValuesType,
	WindowEntry extends WindowEntryType,
>({ uid, entry, children }: WindowFormType<WindowEntry>) {
	const { getWindow } = useModalStore();

	const windowConfig = getWindow(uid) as
		| WindowConfig<FormValues, WindowEntry>
		| undefined;
	const windowDefinition = windowConfig?.definition;

	// Guards
	if (!windowConfig) {
		throw new Error(`Window config not found for uid: ${uid}`);
	}

	if (!windowDefinition) {
		throw new Error(`Window definition not found for uid: ${uid}`);
	}

	const {
		getFormState,
		getFormValues,
		validateForm,
		operationFunction: formOperationFunction,
		button: buttonSubmit,
	} = windowDefinition;

	const eventsOnFormProcess = windowConfig.events;

	// + Guards
	if (!getFormState) {
		throw new Error(`getFormState not found for uid: ${uid}`);
	}

	if (!getFormValues) {
		throw new Error(`getFormValues not found for uid: ${uid}`);
	}

	if (!validateForm) {
		throw new Error(`validateForm not found for uid: ${uid}`);
	}

	if (!formOperationFunction) {
		throw new Error(`operationFunction not defined for window: ${uid}`);
	}

	// WindowForm only handles form operations.
	const operationFunction =
		formOperationFunction as FormOperationFunctionType<unknown, FormValues>;

	const initState = getFormState(entry);

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
				operationFunction,
				entry && 'id' in entry ? (entry.id as number) : undefined, // Present for update, undefined for create
			),
		initState,
	);

	const [formValues, setFormValues] = useFormValues<FormValues>(state.values);

	const { errors, submitted, markSubmit, markFieldAsTouched } =
		useFormValidation({ formValues, validateForm, debounceDelay: 800 });

	useWindowFormProcessed({
		state,
		windowConfig,
		eventsOnFormProcess,
	});

	const handleChange = createHandleChange<FormValues>(
		setFormValues,
		markFieldAsTouched,
	);

	return (
		<WindowFormProvider
			value={{
				formOperation: windowConfig.action,
				formValues,
				errors,
				handleChange,
				pending,
			}}
		>
			<form
				action={action}
				onSubmit={markSubmit}
				className="form-section"
			>
				{children}

				<div className="flex justify-end gap-3">
					<FormComponentSubmit
						pending={pending}
						submitted={submitted}
						errors={errors as Record<string, string[]>} // remove `as`
						button={{
							variant: buttonSubmit?.variant || 'info',
							label: buttonSubmit?.label || 'Submit',
							icon: getActionIcon(buttonSubmit?.icon || 'submit'),
						}}
					/>
				</div>

				{state.situation === 'error' && state.message && (
					<FormError>
						<React.Fragment key="form-error-content">
							<Icons.Status.Error />
							<div>{state.message}</div>
						</React.Fragment>
					</FormError>
				)}
			</form>
		</WindowFormProvider>
	);
}
