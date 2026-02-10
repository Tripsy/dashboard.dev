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
import { FormWrapperComponent } from '@/components/form/form-wrapper';
import { Icons } from '@/components/icon.component';
import { SuccessComponent } from '@/components/status.component';
import Routes from '@/config/routes.setup';
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

	const { errors, submitted, markSubmit, markFieldAsTouched } =
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

	if (state.situation === 'csrf_error') {
		throw new Error(state.message as string);
	}

	if (state.situation === 'success') {
		return (
			<SuccessComponent
				title="Email Confirmation Sent"
				description="Please
					check your email and follow instructions to complete the
					confirmation process."
			>
				<div className="text-center mt-6">
					Meanwhile you can go back to{' '}
					<Link
						href={Routes.get('home')}
						className="text-primary font-medium hover:underline"
					>
						home page
					</Link>
				</div>
			</SuccessComponent>
		);
	}

	return (
		<FormWrapperComponent
			title="Get Your Email Confirmation"
			description="Use the form below to re-send the confirmation email to the email address you used to register."
		>
			<form
				action={action}
				onSubmit={markSubmit}
				className="form-section"
			>
				<FormCsrf />

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

				{state.situation === 'error' && state.message && (
					<FormError>
						<div>
							<Icons.Status.Error /> {state.message}
						</div>
					</FormError>
				)}

				<div className="text-center space-y-2">
					<p className="text-sm text-muted-foreground">
						Not registered yet?{' '}
						<Link
							href={Routes.get('register')}
							className="text-primary font-medium hover:underline"
						>
							Create an account
						</Link>
					</p>
				</div>
			</form>
		</FormWrapperComponent>
	);
}
