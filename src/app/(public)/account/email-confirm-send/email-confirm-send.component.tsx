'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { emailConfirmSendAction } from '@/app/(public)/account/email-confirm-send/email-confirm-send.action';
import {
	type EmailConfirmSendFormValuesType,
	type EmailConfirmSendSituationType,
	EmailConfirmSendState,
	validateFormEmailConfirmSend,
} from '@/app/(public)/account/email-confirm-send/email-confirm-send.definition';
import { FormCsrf } from '@/components/form/form-csrf';
import {
	FormComponentEmail,
	FormComponentSubmit,
} from '@/components/form/form-element.component';
import { FormError } from '@/components/form/form-error.component';
import { FormWrapperComponent } from '@/components/form/form-wrapper';
import { SuccessComponent } from '@/components/status.component';
import Routes from '@/config/routes.setup';
import { createHandleChange } from '@/helpers/form.helper';
import { useElementIds } from '@/hooks/use-element-ids.hook';
import { useFormSituation } from '@/hooks/use-form-situation.hook';
import { useFormValidation } from '@/hooks/use-form-validation.hook';
import { useFormValues } from '@/hooks/use-form-values.hook';

export default function EmailConfirmSend() {
	const [state, action, pending] = useActionState(
		emailConfirmSendAction,
		EmailConfirmSendState,
	);

	const [formValues, setFormValues] =
		useFormValues<EmailConfirmSendFormValuesType>(state.values);

	const { formSituation, formMessage, handleValidation } = useFormSituation<
		EmailConfirmSendFormValuesType,
		EmailConfirmSendSituationType
	>(state.situation, state.message);

	const { errors, submitted, markSubmit, markFieldAsTouched } =
		useFormValidation({
			formValues: formValues,
			validateForm: validateFormEmailConfirmSend,
			debounceDelay: 800,
			onValidation: handleValidation,
		});

	const handleChange = createHandleChange(setFormValues, markFieldAsTouched);

	const elementIds = useElementIds(['email'] as const);

	if (formSituation === 'csrfError') {
		throw new Error(formMessage as string);
	}

	if (formSituation === 'success') {
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

				<FormComponentEmail<EmailConfirmSendFormValuesType>
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
					error={formSituation === 'failedValidation'}
					button={{
						label: 'Get confirmation',
						iconLabel: 'submit',
					}}
				/>

				<FormError
					formSituation={formSituation}
					formMessage={formMessage}
				/>

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
