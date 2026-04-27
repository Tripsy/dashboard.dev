'use client';

import { useRouter } from 'next/navigation';
import { useActionState, useEffect } from 'react';
import { emailUpdateAction } from '@/app/(public)/account/email-update/email-update.action';
import {
	type EmailUpdateFormValuesType,
	EmailUpdateState,
	validateFormEmailUpdate,
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
import { Link } from '@/components/ui/link';
import Routes from '@/config/routes.setup';
import { createHandleChange } from '@/helpers/form.helper';
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
		useFormValues<EmailUpdateFormValuesType>(state.values);

	const { errors, submitted, markSubmit, markFieldAsTouched } =
		useFormValidation({
			formValues: formValues,
			validateForm: validateFormEmailUpdate,
			debounceDelay: 800,
		});

	const handleChange = createHandleChange(setFormValues, markFieldAsTouched);

	const router = useRouter();

	// Refresh auth & redirect to `/account/me`
	useEffect(() => {
		if (state.situation === 'success') {
			router.replace(`${Routes.get('account-me')}?from=emailUpdate`);
		}
	}, [state.situation, router]);

	const elementIds = useElementIds(['emailNew'] as const);

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

				<FormComponentEmail<EmailUpdateFormValuesType>
					labelText="New Email"
					id={elementIds.emailNew}
					fieldName="email_new"
					fieldValue={formValues.email_new ?? ''}
					disabled={pending}
					onChange={(e) => handleChange('email_new', e.target.value)}
					error={errors.email_new}
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
							label: 'Update',
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
