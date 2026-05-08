'use client';

import React, { useActionState, useCallback, useRef, useState } from 'react';
import { FormComponentSubmit } from '@/components/form/form-element.component';
import { FormError } from '@/components/form/form-error.component';
import { Icons } from '@/components/icon.component';
import { Button } from '@/components/ui/button';
import { createHandleChange, processForm } from '@/helpers/form.helper';
import { useWindowFormProcessed } from '@/hooks/use-form-processed.hook';
import { useFormValidation } from '@/hooks/use-form-validation.hook';
import { useFormValues } from '@/hooks/use-form-values.hook';
import { WindowFormProvider } from '@/providers/window-form.provider';
import { useModalStore } from '@/stores/window.store';
import type { FormOperationFunctionType } from '@/types/action.type';
import type {
	FormErrorsType,
	FormStateType,
	FormValuesType,
} from '@/types/form.type';
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
	const { getWindow, close } = useModalStore();

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

	const windowEvents = windowConfig.events;

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
		formOperationFunction as FormOperationFunctionType<
			WindowEntry,
			FormValues
		>;

	const initState = getFormState(entry);
	const entryId = entry && 'id' in entry ? (entry.id as number) : undefined; // Present for update, undefined for create

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
				entryId,
			),
		initState,
	);

	const [formValues, setFormValues] = useFormValues<FormValues>(state.values);

	const [formSituation, setFormSituation] = useState(state.situation);
	const [formMessage, setFormMessage] = useState(state.message);

	// Reset when a new server response comes in
	const prevStateRef = useRef(state);

	if (prevStateRef.current !== state) {
		prevStateRef.current = state;
		setFormSituation(state.situation);
		setFormMessage(state.message);
	}

	const handleValidation = useCallback(
		(errors: FormErrorsType<FormValues>) => {
			const hasErrors = Object.keys(errors ?? {}).length > 0;

			if (hasErrors) {
				setFormSituation('failedValidation');
				setFormMessage(
					`${Object.keys(errors).length} field(s) need attention`,
				);
			} else {
				setFormSituation((prev) =>
					prev === 'failedValidation' ? null : prev,
				);
				setFormMessage((prev) => (prev === formMessage ? null : prev));
			}
		},
		[formMessage],
	);

	const {
		errors: formErrors,
		submitted,
		markSubmit,
		markFieldAsTouched,
	} = useFormValidation({
		formValues,
		validateForm,
		debounceDelay: 800,
		onValidation: handleValidation,
	});

	useWindowFormProcessed({
		state,
		windowConfig,
		windowEvents,
		entryId,
	});

	const handleChange = createHandleChange<FormValues>(
		setFormValues,
		markFieldAsTouched,
	);

	const handleClose = () => {
		close(uid);
		windowEvents?.close?.();
	};

	return (
		<WindowFormProvider
			value={{
				formOperation: windowConfig.action,
				formValues,
				errors: formErrors,
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
					<Button
						variant="outline"
						hover="warning"
						onClick={handleClose}
						title="Cancel"
						disabled={pending}
					>
						<Icons.Action.Cancel />
						Cancel
					</Button>
					<FormComponentSubmit
						pending={pending}
						submitted={submitted}
						error={formSituation === 'failedValidation'}
						button={{
							variant: buttonSubmit?.variant || 'info',
							label: (buttonSubmit?.label as string) || 'Submit',
							iconLabel: buttonSubmit?.icon || 'submit',
						}}
					/>
				</div>

				{formSituation && formSituation !== 'success' && (
					<FormError>
						<React.Fragment key="form-error-content">
							<div className="flex items-center gap-1.5 mb-2">
								<Icons.Status.Error />
								<div>{formMessage}</div>
							</div>
						</React.Fragment>
					</FormError>
				)}
			</form>
		</WindowFormProvider>
	);
}
