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
import { FormPart } from '@/components/form/form-part.component';
import { Icons } from '@/components/icon.component';
import { Loading } from '@/components/loading.component';
import RoutesSetup from '@/config/routes.setup';
import { Configuration } from '@/config/settings.config';
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

	// Refresh auth & redirect to `/status/error`
	useEffect(() => {
		if (state?.situation === 'success' && router) {
			router.replace(
				`${RoutesSetup.get('status', { type: 'error' })}?r=account_delete`,
			);
		}
	}, [state?.situation, router]);

	const elementIds = useElementIds(['passwordCurrent']);

	if (authStatus === 'loading') {
		return <Loading text="Loading..." />;
	}

	if (!auth) {
		return (
			<div>
				<h1 className="text-center">Not Authenticated</h1>
				<div className="text-sm">
					<Icons.Status.Error className="text-error mr-1" />
					Please{' '}
					<Link
						href={RoutesSetup.get('login')}
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

	if (state?.situation === 'csrf_error') {
		return (
			<div className="form-section">
				<h1 className="text-center">My Account - Delete request</h1>

				<div className="text-sm text-error">
					<Icons.Status.Error /> {state.message}
				</div>
			</div>
		);
	}

	return (
		<form action={action} onSubmit={markSubmit} className="form-section">
			<FormCsrf
				inputName={Configuration.get('csrf.inputName') as string}
			/>

			<h1 className="text-center">My Account - Delete request</h1>

			<FormPart className="text-sm">
				<span>
					<Icons.Status.Warning className="mr-1 text-warning" />
					Using the form below will start the process of deleting your
					account, which may take between 5–30 days.{' '}
					<strong>
						Please note that you will lose access to your account
						immediately.
					</strong>
				</span>
			</FormPart>

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
				<a
					href={RoutesSetup.get('account-me')}
					className="btn btn-action-cancel"
					title="Cancel & Go back to my account"
				>
					Cancel
				</a>
				<FormComponentSubmit
					pending={pending}
					submitted={submitted}
					errors={errors}
					buttonLabel="Delete account"
					buttonIcon={<Icons.Action.Destroy />}
				/>
			</div>

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
