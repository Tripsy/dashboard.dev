'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { passwordRecoverAction } from '@/app/(public)/account/password-recover/password-recover.action';
import {
	type PasswordRecoverFormValuesType,
	type PasswordRecoverSituationType,
	PasswordRecoverState,
	validateFormPasswordRecover,
} from '@/app/(public)/account/password-recover/password-recover.definition';
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

export default function PasswordRecover() {
	const [state, action, pending] = useActionState(
		passwordRecoverAction,
		PasswordRecoverState,
	);

	const [formValues, setFormValues] =
		useFormValues<PasswordRecoverFormValuesType>(state.values);

	const { formSituation, formMessage, handleValidation } = useFormSituation<
		PasswordRecoverFormValuesType,
		PasswordRecoverSituationType
	>(state.situation, state.message);

	const { errors, submitted, markSubmit, markFieldAsTouched } =
		useFormValidation({
			formValues: formValues,
			validateForm: validateFormPasswordRecover,
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
				title="Recover Password"
				description="Please
					check your email and follow instructions to complete
					password recovery."
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
			title="Recover Password"
			description="Restore your access and continue using your account securely."
		>
			<form
				action={action}
				onSubmit={markSubmit}
				className="form-section"
			>
				<FormCsrf />

				<FormComponentEmail<PasswordRecoverFormValuesType>
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
						label: 'Recover password',
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
