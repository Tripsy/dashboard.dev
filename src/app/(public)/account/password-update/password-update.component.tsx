'use client';

import { useRouter } from 'next/navigation';
import { useActionState, useEffect, useState } from 'react';
import { passwordUpdateAction } from '@/app/(public)/account/password-update/password-update.action';
import {
	type PasswordUpdateFormValuesType,
	PasswordUpdateState,
	validateFormPasswordUpdate,
} from '@/app/(public)/account/password-update/password-update.definition';
import { FormCsrf } from '@/components/form/form-csrf';
import {
	FormComponentPassword,
	FormComponentSubmit,
} from '@/components/form/form-element.component';
import { FormError } from '@/components/form/form-error.component';
import { FormWrapperComponent } from '@/components/form/form-wrapper';
import { Icons } from '@/components/icon.component';
import { LoadingComponent } from '@/components/status.component';
import { Link } from '@/components/ui/link';
import Routes from '@/config/routes.setup';
import { createHandleChange } from '@/helpers/form.helper';
import { useElementIds } from '@/hooks/use-element-ids.hook';
import { useFormValidation } from '@/hooks/use-form-validation.hook';
import { useFormValues } from '@/hooks/use-form-values.hook';
import { useAuth } from '@/providers/auth.provider';

export default function PasswordUpdate() {
	const [showPassword, setShowPassword] = useState(false);

	const { auth, authStatus } = useAuth();

	const [state, action, pending] = useActionState(
		passwordUpdateAction,
		PasswordUpdateState,
	);

	const [formValues, setFormValues] =
		useFormValues<PasswordUpdateFormValuesType>(state.values);

	const { errors, submitted, markSubmit, markFieldAsTouched } =
		useFormValidation({
			formValues: formValues,
			validateForm: validateFormPasswordUpdate,
			debounceDelay: 800,
		});

	const handleChange = createHandleChange(setFormValues, markFieldAsTouched);

	const router = useRouter();

	// Refresh auth & redirect to `/account/me`
	useEffect(() => {
		if (state.situation === 'success') {
			router.replace(`${Routes.get('account-me')}?from=passwordUpdate`);
		}
	}, [state.situation, router]);

	const elementIds = useElementIds([
		'passwordCurrent',
		'passwordNew',
		'passwordConfirm',
	]);

	if (authStatus === 'loading') {
		return <LoadingComponent />;
	}

	if (!auth) {
		router.replace(Routes.get('login'));
		return null;
	}

	if (state.situation === 'csrf_error') {
		throw new Error(state.message as string);
	}

	return (
		<FormWrapperComponent
			title="My Account - Password update"
			description="Change your password by entering the current password and a new one."
		>
			<form
				action={action}
				onSubmit={markSubmit}
				className="form-section"
			>
				<FormCsrf />

				<FormComponentPassword<PasswordUpdateFormValuesType>
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

				<FormComponentPassword<PasswordUpdateFormValuesType>
					labelText="New Password"
					id={elementIds.passwordNew}
					fieldName="password_new"
					fieldValue={formValues.password_new ?? ''}
					placeholderText="New password"
					disabled={pending}
					onChange={(e) =>
						handleChange('password_new', e.target.value)
					}
					error={errors.password_new}
					showPassword={showPassword}
				/>

				<FormComponentPassword<PasswordUpdateFormValuesType>
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
					<Link
						href={Routes.get('account-me')}
						title="Cancel & Go back to my account"
						variant="outline"
						hover="warning"
					>
						<Icons.Action.Cancel /> Cancel
					</Link>
					<FormComponentSubmit
						pending={pending}
						submitted={submitted}
						errors={errors}
						button={{
							label: 'Update password',
							iconLabel: 'save',
						}}
					/>
				</div>

				{state.situation === 'error' && state.message && (
					<FormError>
						<div className="flex items-center gap-1.5">
							<Icons.Status.Error />
							<div>{state.message}</div>
						</div>
					</FormError>
				)}
			</form>
		</FormWrapperComponent>
	);
}
