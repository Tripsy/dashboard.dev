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
import { FormWrapperComponent } from '@/components/form/form-wrapper';
import { Icons } from '@/components/icon.component';
import { LoadingComponent } from '@/components/status.component';
import { Button } from '@/components/ui/button';
import Routes from '@/config/routes.setup';
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
		if (state.situation === 'success' && router) {
			router.replace(`${Routes.get('account-me')}?from=emailUpdate`);
		}
	}, [state.situation, router]);

	const elementIds = useElementIds(['emailNew']);

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
			title="My Account - Email update"
			description="Email confirmation will be required before switching to the
					new email address."
		>
			<form
				action={action}
				onSubmit={markSubmit}
				className="form-section"
			>
				<FormCsrf />

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
							label: 'Update',
							icon: Icons.Action.Go,
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
