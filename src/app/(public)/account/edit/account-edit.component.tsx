'use client';

import { useRouter } from 'next/navigation';
import { useActionState, useEffect } from 'react';
import { accountEditAction } from '@/app/(public)/account/edit/account-edit.action';
import {
	type AccountEditFormValuesType,
	AccountEditState,
	validateFormAccountEdit,
} from '@/app/(public)/account/edit/account-edit.definition';
import { FormCsrf } from '@/components/form/form-csrf';
import {
	FormComponentName,
	FormComponentRadio,
	FormComponentSubmit,
} from '@/components/form/form-element.component';
import { FormError } from '@/components/form/form-error.component';
import { FormWrapperComponent } from '@/components/form/form-wrapper';
import { Icons } from '@/components/icon.component';
import { LoadingComponent } from '@/components/status.component';
import { Link } from '@/components/ui/link';
import Routes from '@/config/routes.setup';
import { createHandleChange, toOptionsFromEnum } from '@/helpers/form.helper';
import { formatEnumLabel } from '@/helpers/string.helper';
import { useElementIds } from '@/hooks/use-element-ids.hook';
import { useFormValidation } from '@/hooks/use-form-validation.hook';
import { useFormValues } from '@/hooks/use-form-values.hook';
import {
	LANGUAGE_DEFAULT,
	type Language,
	LanguageEnum,
} from '@/models/user.model';
import { useAuth } from '@/providers/auth.provider';

const languages = toOptionsFromEnum(LanguageEnum, {
	formatter: formatEnumLabel,
});

export default function AccountEdit() {
	const { auth, authStatus, refreshAuth } = useAuth();

	const [state, action, pending] = useActionState(accountEditAction, {
		...AccountEditState,
		values: {
			name: auth?.name ?? '',
			language: auth?.language ?? LANGUAGE_DEFAULT,
		},
	});

	const [formValues, setFormValues] =
		useFormValues<AccountEditFormValuesType>(state.values);

	const { errors, submitted, markSubmit, markFieldAsTouched } =
		useFormValidation({
			formValues: formValues,
			validateForm: validateFormAccountEdit,
			debounceDelay: 800,
		});

	const handleChange = createHandleChange(setFormValues, markFieldAsTouched);

	const router = useRouter();

	// Refresh auth & redirect to `/account/me`
	useEffect(() => {
		if (state.situation === 'success') {
			(async () => {
				await refreshAuth();
			})();

			router.replace(`${Routes.get('account-me')}?from=edit`);
		}
	}, [state.situation, router, refreshAuth]);

	const elementIds = useElementIds(['name', 'language']);

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
			title="My Account - Edit"
			description="Change your account details below."
		>
			<form
				action={action}
				onSubmit={markSubmit}
				className="form-section"
			>
				<FormCsrf />

				<FormComponentName<AccountEditFormValuesType>
					labelText="Name"
					id={elementIds.name}
					fieldValue={formValues.name ?? ''}
					disabled={pending}
					onChange={(e) => handleChange('name', e.target.value)}
					error={errors.name}
				/>

				<FormComponentRadio<AccountEditFormValuesType>
					labelText="Language"
					id={elementIds.language}
					fieldName="language"
					fieldValue={formValues.language}
					disabled={pending}
					options={languages}
					onChange={(value) =>
						handleChange('language', value as Language)
					}
					error={errors.language}
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
							label: 'Save',
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
