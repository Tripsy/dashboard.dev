'use client';

import { useState } from 'react';
import type { PasswordUpdateFormValuesType } from '@/app/(public)/account/password-update/password-update.definition';
import { FormComponentPassword } from '@/components/form/form-element.component';
import { useElementIds } from '@/hooks/use-element-ids.hook';
import { useWindowForm } from '@/providers/window-form.provider';

export function FormManagePasswordUpdate() {
	const [showPassword, setShowPassword] = useState(false);

	const { formValues, errors, handleChange, pending } =
		useWindowForm<PasswordUpdateFormValuesType>();

	const elementIds = useElementIds([
		'passwordCurrent',
		'passwordNew',
		'passwordConfirm',
	] as const);

	return (
		<>
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
				onChange={(e) => handleChange('password_new', e.target.value)}
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
		</>
	);
}
