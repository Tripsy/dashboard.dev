'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useActionState, useEffect } from 'react';
import {
	accountEditAction,
	accountEditValidate,
} from '@/app/(public)/account/edit/account-edit.action';
import {
	type AccountEditFormFieldsType,
	AccountEditState,
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
import { Button } from '@/components/ui/button';
import Routes from '@/config/routes.setup';
import { capitalizeFirstLetter } from '@/helpers/string.helper';
import { useElementIds } from '@/hooks/use-element-ids.hook';
import { useFormValidation } from '@/hooks/use-form-validation.hook';
import { useFormValues } from '@/hooks/use-form-values.hook';
import { LanguageEnum } from '@/models/user.model';
import { useAuth } from '@/providers/auth.provider';

const languages = Object.values(LanguageEnum).map((language) => ({
	label: capitalizeFirstLetter(language),
	value: language,
}));

export default function AccountEdit() {
	const { auth, authStatus, refreshAuth } = useAuth();

	const [state, action, pending] = useActionState(
		accountEditAction,
		AccountEditState,
	);

	const [formValues, setFormValues] =
		useFormValues<AccountEditFormFieldsType>(state.values);

	useEffect(() => {
		if (authStatus === 'authenticated' && auth) {
			setFormValues({
				name: auth.name || '',
				language: auth.language || LanguageEnum.EN,
			});
		}
	}, [authStatus, auth, setFormValues]);

	const { errors, submitted, markSubmit, markFieldAsTouched } =
		useFormValidation({
			formValues: formValues,
			validate: accountEditValidate,
			debounceDelay: 800,
		});

	const handleChange = (
		name: string,
		value: string | boolean | number | Date,
	) => {
		setFormValues((prev) => ({ ...prev, [name]: value }));
		markFieldAsTouched(name as keyof AccountEditFormFieldsType);
	};

	const router = useRouter();

	// Refresh auth & redirect to `/account/me`
	useEffect(() => {
		if (state.situation === 'success' && router) {
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
		throw new Error('Not authenticated.');
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

				<FormComponentName
					labelText="Name"
					id={elementIds.name}
					fieldValue={formValues.name ?? ''}
					disabled={pending}
					onChange={(e) => handleChange('name', e.target.value)}
					error={errors.name}
				/>

				<FormComponentRadio
					labelText="Language"
					id={elementIds.language}
					fieldName="language"
					fieldValue={formValues.language}
					disabled={pending}
					options={languages}
					onValueChange={(value) => handleChange('language', value)}
					error={errors.language}
				/>

				<div className="flex justify-end gap-2">
					<Button variant="cancel">
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
						buttonLabel="Save"
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
		</FormWrapperComponent>
	);
}
