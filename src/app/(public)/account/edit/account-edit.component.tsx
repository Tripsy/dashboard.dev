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
import { Icons } from '@/components/icon.component';
import { Loading } from '@/components/loading.component';
import RoutesSetup from '@/config/routes.setup';
import { Configuration } from '@/config/settings.config';
import { LanguageEnum } from '@/entities/user.model';
import { capitalizeFirstLetter } from '@/helpers/string.helper';
import { useElementIds, useFormValidation, useFormValues } from '@/hooks';
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

	const { errors, submitted, setSubmitted, markFieldAsTouched } =
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
		if (state?.situation === 'success' && router) {
			(async () => {
				await refreshAuth();
			})();

			router.replace(`${RoutesSetup.get('account-me')}?from=edit`);
		}
	}, [state?.situation, router, refreshAuth]);

	const elementIds = useElementIds(['name', 'language']);

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
				<h1 className="text-center">My Account - Edit</h1>

				<div className="text-sm text-error">
					<Icons.Status.Error /> {state.message}
				</div>
			</div>
		);
	}

	return (
		<form
			action={action}
			onSubmit={() => setSubmitted(true)}
			className="form-section"
		>
			<FormCsrf
				inputName={Configuration.get('csrf.inputName') as string}
			/>
			<h1 className="text-center">My Account - Edit</h1>
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
				options={languages}
				disabled={pending}
				onChange={(e) => handleChange('language', e.target.value)}
				error={errors.language}
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
					buttonLabel="Save"
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
