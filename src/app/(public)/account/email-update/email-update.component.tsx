'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useActionState, useEffect } from 'react';
import {
	emailUpdateAction,
	emailUpdateValidate,
} from '@/app/(public)/account/email-update/email-update.action';
import {
	type EmailUpdateFormFieldsType,
	EmailUpdateState,
} from '@/app/(public)/account/email-update/email-update.definition';
import { FormCsrf } from '@/components/form/form-csrf';
import {
	FormComponentEmail,
	FormComponentSubmit,
} from '@/components/form/form-element.component';
import { FormError } from '@/components/form/form-error.component';
import { FormPart } from '@/components/form/form-part.component';
import { Icons } from '@/components/icon.component';
import { Loading } from '@/components/loading.component';
import Routes from '@/config/routes.setup';
import { Configuration } from '@/config/settings.config';
import { useElementIds } from '@/hooks/use-element-ids.hook';
import { useFormValidation } from '@/hooks/use-form-validation.hook';
import { useFormValues } from '@/hooks/use-form-values.hook';
import { useAuth } from '@/providers/auth.provider';

export default function EmailUpdate() {
	const { auth, authStatus } = useAuth();

	const [state, action, pending] = useActionState(
		emailUpdateAction,
		EmailUpdateState,
	);

	const [formValues, setFormValues] =
		useFormValues<EmailUpdateFormFieldsType>(state.values);

	const { errors, submitted, markSubmit, markFieldAsTouched } =
		useFormValidation({
			formValues: formValues,
			validate: emailUpdateValidate,
			debounceDelay: 800,
		});

	const handleChange = (
		name: string,
		value: string | boolean | number | Date,
	) => {
		setFormValues((prev) => ({ ...prev, [name]: value }));
		markFieldAsTouched(name as keyof EmailUpdateFormFieldsType);
	};

	const router = useRouter();

	// Refresh auth & redirect to `/account/me`
	useEffect(() => {
		if (state?.situation === 'success' && router) {
			router.replace(`${Routes.get('account-me')}?from=emailUpdate`);
		}
	}, [state?.situation, router]);

	const elementIds = useElementIds(['emailNew']);

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

	if (state?.situation === 'csrf_error') {
		return (
			<div className="form-section">
				<h1 className="text-center">My Account - Email update</h1>

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

			<h1 className="text-center">My Account - Email update</h1>

			<FormPart className="text-sm">
				<span>
					<Icons.Info className="mr-1 text-info" />
					Email confirmation will be required before switching to the
					new email address.
				</span>
			</FormPart>

			<FormComponentEmail
				labelText="New Email"
				id={elementIds.emailNew}
				fieldName="email_new"
				fieldValue={formValues.email_new ?? ''}
				disabled={pending}
				onChange={(e) => handleChange('email_new', e.target.value)}
				error={errors.email_new}
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
					buttonLabel="Update"
					buttonIcon={<Icons.Action.Go />}
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
