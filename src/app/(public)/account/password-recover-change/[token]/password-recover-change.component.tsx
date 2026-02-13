'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import React, { useActionState, useState } from 'react';
import {
	passwordRecoverChangeAction,
	passwordRecoverChangeValidate,
} from '@/app/(public)/account/password-recover-change/[token]/password-recover-change.action';
import {
	type PasswordRecoverChangeFormFieldsType,
	PasswordRecoverChangeState,
} from '@/app/(public)/account/password-recover-change/[token]/password-recover-change.definition';
import { FormCsrf } from '@/components/form/form-csrf';
import {
	FormComponentPassword,
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
import {createHandleChange} from "@/helpers/form.helper";

export default function PasswordRecoverChange() {
	const params = useParams<{ token: string }>();

	const token = params.token;

	const [state, action, pending] = useActionState(
		passwordRecoverChangeAction,
		{
			...PasswordRecoverChangeState,
			token: token,
		},
	);

	const [showPassword, setShowPassword] = useState(false);

	const [formValues, setFormValues] =
		useFormValues<PasswordRecoverChangeFormFieldsType>(state.values);

	const { errors, submitted, markSubmit, markFieldAsTouched } =
		useFormValidation({
			formValues: formValues,
			validate: passwordRecoverChangeValidate,
			debounceDelay: 800,
		});

	const handleChange = createHandleChange(
		setFormValues,
		markFieldAsTouched
	);

	const elementIds = useElementIds(['password', 'passwordConfirm']);

	if (state.situation === 'csrf_error') {
		throw new Error(state.message as string);
	}

	if (state.situation === 'success') {
		return (
			<SuccessComponent
				title="Recover Password"
				description="Your password has been updated successfully."
			>
				<div className="text-center mt-6">
					You can now go to the{' '}
					<Link
						href={Routes.get('login')}
						className="text-primary font-medium hover:underline"
					>
						login page
					</Link>{' '}
					and sign in with your new password.
				</div>
			</SuccessComponent>
		);
	}

	return (
		<FormWrapperComponent
			title="Recover Password"
			description="Set up a new password for your account."
		>
			<form
				action={action}
				onSubmit={markSubmit}
				className="form-section"
			>
				<FormCsrf />

				<FormComponentPassword<PasswordRecoverChangeFormFieldsType>
					labelText="New Password"
					id={elementIds.password}
					fieldName="password"
					fieldValue={formValues.password ?? ''}
					disabled={pending}
					onChange={(e) => handleChange('password', e.target.value)}
					error={errors.password}
					showPassword={showPassword}
					setShowPassword={setShowPassword}
				/>

				<FormComponentPassword<PasswordRecoverChangeFormFieldsType>
					labelText="Confirm Password"
					id={elementIds.passwordConfirm}
					fieldName="password_confirm"
					fieldValue={formValues.password_confirm ?? ''}
					placeholderText="Password confirmation"
					disabled={pending}
					onChange={(e) =>
						handleChange('password_confirm', e.target.value)
					}
					error={errors.password_confirm}
					showPassword={showPassword}
				/>

				<FormComponentSubmit
					pending={pending}
					submitted={submitted}
					errors={errors}
					button={{
						label: 'Set password',
						icon: Icons.Action.Go,
					}}
				/>

				{state.situation === 'error' && state.message && (
					<FormError>
						<React.Fragment key="error-content">
							<Icons.Status.Error />
							<div>{state.message}</div>
						</React.Fragment>
					</FormError>
				)}
			</form>
		</FormWrapperComponent>
	);
}
