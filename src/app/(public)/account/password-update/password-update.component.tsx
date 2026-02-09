'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useActionState, useEffect, useState } from 'react';
import {
	passwordUpdateAction,
	passwordUpdateValidate,
} from '@/app/(public)/account/password-update/password-update.action';
import {
	type PasswordUpdateFormFieldsType,
	PasswordUpdateState,
} from '@/app/(public)/account/password-update/password-update.definition';
import { FormCsrf } from '@/components/form/form-csrf';
import {
	FormComponentPassword,
	FormComponentSubmit,
} from '@/components/form/form-element.component';
import { FormError } from '@/components/form/form-error.component';
import { Icons } from '@/components/icon.component';
import { LoadingComponent } from '@/components/status.component';
import Routes from '@/config/routes.setup';
import { useElementIds } from '@/hooks/use-element-ids.hook';
import { useFormValidation } from '@/hooks/use-form-validation.hook';
import { useFormValues } from '@/hooks/use-form-values.hook';
import { useAuth } from '@/providers/auth.provider';

export default function PasswordUpdate() {
	const { auth, authStatus } = useAuth();

	const [state, action, pending] = useActionState(
		passwordUpdateAction,
		PasswordUpdateState,
	);

	const [showPassword, setShowPassword] = useState(false);

	const [formValues, setFormValues] =
		useFormValues<PasswordUpdateFormFieldsType>(state.values);

	const { errors, submitted, markSubmit, markFieldAsTouched } =
		useFormValidation({
			formValues: formValues,
			validate: passwordUpdateValidate,
			debounceDelay: 800,
		});

	const handleChange = (
		name: string,
		value: string | boolean | number | Date,
	) => {
		setFormValues((prev) => ({ ...prev, [name]: value }));
		markFieldAsTouched(name as keyof PasswordUpdateFormFieldsType);
	};

	const router = useRouter();

	// Refresh auth & redirect to `/account/me`
	useEffect(() => {
		if (state.situation === 'success' && router) {
			router.replace(`${Routes.get('account-me')}?from=passwordUpdate`);
		}
	}, [state.situation, router]);

	const elementIds = useElementIds([
		'passwordCurrent',
		'passwordNew',
		'passwordConfirm',
	]);

	if (authStatus === 'loading') {
		return <LoadingComponent description="Loading..." />;
	}

	if (!auth) {
		return (
			<div>
				<h1 className="text-center">Not Authenticated</h1>
				<div className="text-sm">
					<Icons.Status.Error className="text-error mr-1" />
					Please{' '}
					<Link
						href={Routes.get('login')}
						title="Sign in"
						className="link link-info link-hover"
					>
						{' '}
						log in{' '}
					</Link>{' '}
					to view your account.
				</div>
			</div>
		);
	}

	if (state.situation === 'csrf_error') {
		throw new Error(state.message as string);
	}

	return (
		<form action={action} onSubmit={markSubmit} className="form-section">
			<FormCsrf />

			<h1 className="text-center">My Account - Password update</h1>

			<FormComponentPassword
				labelText="Current Password"
				id={elementIds.passwordCurrent}
				fieldName="password_current"
				fieldValue={formValues.password_current ?? ''}
				placeholderText="Current password"
				autoComplete="current-password"
				disabled={pending}
				onChange={(e) =>
					handleChange('password_current', e.target.value)
				}
				error={errors.password_current}
				showPassword={showPassword}
				setShowPassword={setShowPassword}
			/>

			<FormComponentPassword
				labelText="New Password"
				id={elementIds.passwordNew}
				fieldName="password_new"
				fieldValue={formValues.password_new ?? ''}
				placeholderText="New password"
				disabled={pending}
				onChange={(e) => handleChange('password_new', e.target.value)}
				error={errors.password_new}
				showPassword={showPassword}
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

			<div className="flex justify-end gap-2">
				<a
					href={Routes.get('account-me')}
					className="btn btn-action-cancel"
					title="Cancel & Go back to my account"
				>
					Cancel
				</a>
				<FormComponentSubmit
					pending={pending}
					submitted={submitted}
					errors={errors}
					buttonLabel="Update password"
					buttonIcon={<Icons.Action.Go />}
				/>
			</div>

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
