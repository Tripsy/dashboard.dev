'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useActionState, useState } from 'react';
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
import { FormPart } from '@/components/form/form-part.component';
import { Icons } from '@/components/icon.component';
import Routes from '@/config/routes.setup';
import { Configuration } from '@/config/settings.config';
import { useElementIds } from '@/hooks/use-element-ids.hook';
import { useFormValidation } from '@/hooks/use-form-validation.hook';
import { useFormValues } from '@/hooks/use-form-values.hook';

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

	const handleChange = (
		name: string,
		value: string | boolean | number | Date,
	) => {
		setFormValues((prev) => ({ ...prev, [name]: value }));
		markFieldAsTouched(name as keyof PasswordRecoverChangeFormFieldsType);
	};

	const elementIds = useElementIds(['password', 'passwordConfirm']);

	if (state?.situation === 'csrf_error') {
		return (
			<div className="form-section">
				<h1 className="text-center">Recover Password</h1>

				<div className="text-sm text-error">
					<Icons.Status.Error /> {state.message}
				</div>
			</div>
		);
	}

	if (state?.situation === 'success') {
		return (
			<div className="form-section">
				<h1 className="text-center">Recover Password</h1>

				<div className="text-sm">
					<Icons.Status.Success className="text-success" /> Your
					password has been updated successfully.
				</div>

				<p className="mt-2 text-center">
					<span className="text-sm text-gray-500 dark:text-base-content">
						You can now go to the{' '}
						<Link
							href={Routes.get('login')}
							className="link link-info link-hover text-sm"
						>
							login page
						</Link>{' '}
						and sign in with your new password.
					</span>
				</p>
			</div>
		);
	}

	return (
		<form action={action} onSubmit={markSubmit} className="form-section">
			<FormCsrf />

			<h1 className="text-center">Recover Password</h1>

			<FormPart className="text-sm text-center md:max-w-xs">
				<span>
					Use the form below to set up a new password for your
					account.
				</span>
			</FormPart>

			<FormComponentPassword
				labelText="Password"
				id={elementIds.password}
				fieldValue={formValues.password ?? ''}
				disabled={pending}
				onChange={(e) => handleChange('password', e.target.value)}
				error={errors.password}
				showPassword={showPassword}
				setShowPassword={setShowPassword}
			/>

			<FormComponentPassword
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
				buttonLabel="Set password"
				buttonIcon={<Icons.Action.Go />}
			/>

			{state?.situation === 'error' && state.message && (
				<FormError>
					<div>
						<Icons.Status.Error /> {state.message}
					</div>
				</FormError>
			)}
		</form>
	);
}
