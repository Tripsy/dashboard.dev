'use client';

import { useState } from 'react';
import type { AccountDeleteFormValuesType } from '@/app/(public)/account/delete/account-delete.definition';
import { FormComponentPassword } from '@/components/form/form-element.component';
import { useElementIds } from '@/hooks/use-element-ids.hook';
import { useWindowForm } from '@/providers/window-form.provider';

export function FormManageAccountDelete() {
	const [showPassword, setShowPassword] = useState(false);

	const { formValues, errors, handleChange, pending } =
		useWindowForm<AccountDeleteFormValuesType>();

	const elementIds = useElementIds(['passwordCurrent'] as const);

	return (
		<>
			<p className="text-sm text-muted">
				This starts the process of deleting your account, which may take
				between 5–30 days. You will lose access to your account
				immediately.
			</p>

			<FormComponentPassword<AccountDeleteFormValuesType>
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
		</>
	);
}
