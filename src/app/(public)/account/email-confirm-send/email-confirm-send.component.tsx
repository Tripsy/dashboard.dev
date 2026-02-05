'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import {
	emailConfirmSendAction,
	emailConfirmSendValidate,
} from '@/app/(public)/account/email-confirm-send/email-confirm-send.action';
import {
	type EmailConfirmSendFormFieldsType,
	EmailConfirmSendState,
} from '@/app/(public)/account/email-confirm-send/email-confirm-send.definition';
import { FormCsrf } from '@/components/form/form-csrf';
import {
	FormComponentEmail,
	FormComponentSubmit,
} from '@/components/form/form-element.component';
import { FormError } from '@/components/form/form-error.component';
import { FormPart } from '@/components/form/form-part.component';
import { Icons } from '@/components/icon.component';
import RoutesSetup from '@/config/routes.setup';
import { Configuration } from '@/config/settings.config';
import { useElementIds } from '@/hooks/use-element-ids.hook';
import { useFormValidation } from '@/hooks/use-form-validation.hook';
import { useFormValues } from '@/hooks/use-form-values.hook';

export default function EmailConfirmSend() {
	const [state, action, pending] = useActionState(
		emailConfirmSendAction,
		EmailConfirmSendState,
	);

	const [formValues, setFormValues] =
		useFormValues<EmailConfirmSendFormFieldsType>(state.values);

	const { errors, submitted, setSubmitted, markFieldAsTouched } =
		useFormValidation({
			formValues: formValues,
			validate: emailConfirmSendValidate,
			debounceDelay: 800,
		});

	const handleChange = (
		name: string,
		value: string | boolean | number | Date,
	) => {
		setFormValues((prev) => ({ ...prev, [name]: value }));
		markFieldAsTouched(name as keyof EmailConfirmSendFormFieldsType);
	};

	const elementIds = useElementIds(['email']);

	if (state?.situation === 'csrf_error') {
		return (
			<div className="form-section">
				<h1 className="text-center">Email Confirmation Send</h1>

				<div className="text-sm text-error">
					<Icons.Status.Error /> {state.message}
				</div>
			</div>
		);
	}

	if (state?.situation === 'success') {
		return (
			<div className="form-section">
				<h1 className="text-center">Email Confirmation Send</h1>

				<div className="text-sm">
					<Icons.Status.Success className="text-success" /> Please
					check your email and follow instructions to complete the
					confirmation process.
				</div>

				<p className="mt-2 text-center">
					<span className="text-sm text-gray-500 dark:text-base-content">
						Meanwhile you can go back to{' '}
						<Link
							href={RoutesSetup.get('home')}
							className="link link-info link-hover text-sm"
						>
							home page
						</Link>
					</span>
				</p>
			</div>
		);
	}

	return (
		<form
			action={action}
			onSubmit={() => setSubmitted(true)}
			className="form-section"
		>
			<FormCsrf
				inputName={Configuration.get('csrf.inputName') as string}
			/>

			<h1 className="text-center">Email Confirmation Send</h1>

			<FormPart className="text-sm text-center md:max-w-xs">
				<span>
					Use the form below to re-send the confirmation email to the
					email address you used to register.
				</span>
			</FormPart>

			<FormComponentEmail
				labelText="Email Address"
				id={elementIds.email}
				fieldValue={formValues.email ?? ''}
				disabled={pending}
				onChange={(e) => handleChange('email', e.target.value)}
				error={errors.email}
			/>

			<FormComponentSubmit
				pending={pending}
				submitted={submitted}
				errors={errors}
				buttonLabel="Get confirmation"
				buttonIcon={<Icons.Action.Go />}
			/>

			{state?.situation === 'error' && state.message && (
				<FormError>
					<div>
						<Icons.Status.Error /> {state.message}
					</div>
				</FormError>
			)}

			<FormPart className="text-center">
				<div>
					<span className="text-sm text-gray-500 dark:text-base-content">
						Not registered yet?{' '}
					</span>
					<Link
						href={RoutesSetup.get('register')}
						className="link link-info link-hover text-sm"
					>
						Create an account
					</Link>
				</div>
			</FormPart>
		</form>
	);
}
