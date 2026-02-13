'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useActionState, useEffect, useState } from 'react';
import {
	accountDeleteAction,
	accountDeleteValidate,
} from '@/app/(public)/account/delete/account-delete.action';
import {
	type AccountDeleteFormFieldsType,
	AccountDeleteState,
} from '@/app/(public)/account/delete/account-delete.definition';
import { FormCsrf } from '@/components/form/form-csrf';
import {
	FormComponentPassword,
	FormComponentSubmit,
} from '@/components/form/form-element.component';
import { FormError } from '@/components/form/form-error.component';
import { FormWrapperComponent } from '@/components/form/form-wrapper';
import { Icons } from '@/components/icon.component';
import { LoadingComponent } from '@/components/status.component';
import { Button } from '@/components/ui/button';
import Routes from '@/config/routes.setup';
import { useElementIds } from '@/hooks/use-element-ids.hook';
import { useFormValidation } from '@/hooks/use-form-validation.hook';
import { useFormValues } from '@/hooks/use-form-values.hook';
import { useAuth } from '@/providers/auth.provider';

export default function AccountDelete() {
	const { auth, authStatus } = useAuth();

	const [state, action, pending] = useActionState(
		accountDeleteAction,
		AccountDeleteState,
	);

	const [showPassword, setShowPassword] = useState(false);

	const [formValues, setFormValues] =
		useFormValues<AccountDeleteFormFieldsType>(state.values);

	const { errors, submitted, markSubmit, markFieldAsTouched } =
		useFormValidation({
			formValues: formValues,
			validate: accountDeleteValidate,
			debounceDelay: 800,
		});

	const handleChange = (
		name: string,
		value: string | boolean | number | Date,
	) => {
		setFormValues((prev) => ({ ...prev, [name]: value }));
		markFieldAsTouched(name as keyof AccountDeleteFormFieldsType);
	};

	const router = useRouter();

	// Refresh auth and redirect to `/status/error`
	useEffect(() => {
		if (state.situation === 'success' && router) {
			router.replace(
				`${Routes.get('status', { type: 'error' })}?r=account-delete`,
			);
		}
	}, [state.situation, router]);

	const elementIds = useElementIds(['passwordCurrent']);

	if (authStatus === 'loading') {
		return <LoadingComponent />;
	}

	if (!auth) {
		throw new Error('Not authenticated.');
	}

	if (state.situation === 'csrf_error') {
		throw new Error(state.message as string);
	}

	return (
		<FormWrapperComponent
			title="My Account - Delete request"
			description="Using the form below will start the process of deleting your
					account, which may take between 5–30 days. Please note that you will lose access to your account
						immediately."
		>
			<form
				action={action}
				onSubmit={markSubmit}
				className="form-section"
			>
				<FormCsrf />

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

				<div className="flex justify-end gap-2">
					<Button variant="outline" hover="warning">
						<Link
							href={Routes.get('account-me')}
							title="Cancel & Go back to my account"
							className="flex items-center gap-1"
						>
							<Icons.Action.Cancel /> Cancel
						</Link>
					</Button>
					<FormComponentSubmit
						pending={pending}
						submitted={submitted}
						errors={errors}
						button={{
							variant: 'error',
							label: 'Delete account',
							icon: Icons.Action.Destroy,
						}}
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
		</FormWrapperComponent>
	);
}
