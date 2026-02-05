'use client';

import clsx from 'clsx';
import Link from 'next/link';
import React, { useActionState, useState } from 'react';
import {
	registerAction,
	registerValidate,
} from '@/app/(public)/account/register/register.action';
import {
	type RegisterFormFieldsType,
	RegisterState,
} from '@/app/(public)/account/register/register.definition';
import { FormCsrf } from '@/components/form/form-csrf';
import {
	FormComponentEmail,
	FormComponentName,
	FormComponentPassword,
	FormComponentRadio,
	FormComponentSubmit,
	FormElement,
} from '@/components/form/form-element.component';
import { FormElementError as RawFormElementError } from '@/components/form/form-element-error.component';
import { FormError } from '@/components/form/form-error.component';
import { FormPart } from '@/components/form/form-part.component';
import { Icons } from '@/components/icon.component';
import RoutesSetup from '@/config/routes.setup';
import { Configuration } from '@/config/settings.config';
import { LanguageEnum } from '@/entities/user.model';
import { capitalizeFirstLetter } from '@/helpers/string.helper';

const FormElementError = React.memo(RawFormElementError);

const languages = Object.values(LanguageEnum).map((language) => ({
	label: capitalizeFirstLetter(language),
	value: language,
}));

export default function Register() {
	const [state, action, pending] = useActionState(
		registerAction,
		RegisterState,
	);
	const [showPassword, setShowPassword] = useState(false);

	const [formValues, setFormValues] = useFormValues<RegisterFormFieldsType>(
		state.values,
	);

	const { errors, submitted, setSubmitted, markFieldAsTouched } =
		useFormValidation({
			formValues: formValues,
			validate: registerValidate,
			debounceDelay: 800,
		});

	const handleChange = (
		name: string,
		value: string | boolean | number | Date,
	) => {
		setFormValues((prev) => ({ ...prev, [name]: value }));
		markFieldAsTouched(name as keyof RegisterFormFieldsType);
	};

	const elementIds = useElementIds([
		'name',
		'email',
		'password',
		'passwordConfirm',
		'language',
		'terms',
	]);

	if (state?.situation === 'csrf_error') {
		return (
			<div className="form-section">
				<h1 className="text-center">Create Account</h1>

				<div className="text-sm text-error">
					<Icons.Status.Error /> {state.message}
				</div>
			</div>
		);
	}

	if (state?.situation === 'pending_account') {
		return (
			<div className="form-section">
				<h1 className="text-center">Create Account</h1>

				<div className="text-sm text-error">
					<Icons.Status.Error /> {state.message}
				</div>

				<div className="text-center mt-2">
					<span className="text-sm text-gray-500 dark:text-base-content">
						Have you confirmed your email? If you’ve lost the
						instructions, you can resend the{' '}
					</span>
					<Link
						href={RoutesSetup.get('email-confirm-send')}
						className="link link-info link-hover text-sm"
					>
						confirmation email
					</Link>
				</div>
			</div>
		);
	}

	if (state?.situation === 'success') {
		return (
			<div className="form-section">
				<h1 className="text-center">Create Account</h1>

				<div className="text-sm">
					<p>
						We&apos;ve sent a verification email to{' '}
						<span className="font-semibold">
							{formValues.email}
						</span>
						.
					</p>
					<p>
						Please check your inbox and click the verification link
						to activate your account.
					</p>
				</div>

				<p className="mt-2 text-center">
					<span className="text-sm text-gray-500 dark:text-base-content">
						Meanwhile you can go back to{' '}
						<Link
							href={RoutesSetup.get('home')}
							className="link link-info link-hover text-sm"
						>
							home page
						</Link>
					</span>
				</p>
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
			<h1 className="text-center">Create Account</h1>
			<FormPart className="text-sm text-center md:max-w-xs">
				<>
					Quick access. Extra benefits. Your gateway to personalized
					experiences.
				</>
			</FormPart>
			<FormComponentName
				labelText="Name"
				id={elementIds.name}
				fieldValue={formValues.name ?? ''}
				disabled={pending}
				onChange={(e) => handleChange('name', e.target.value)}
				error={errors.name}
			/>
			<FormComponentEmail
				labelText="Email Address"
				id={elementIds.email}
				fieldValue={formValues.email ?? ''}
				disabled={pending}
				onChange={(e) => handleChange('email', e.target.value)}
				error={errors.email}
			/>
			<FormComponentPassword
				labelText="Password"
				id={elementIds.password}
				fieldValue={formValues.password ?? ''}
				disabled={pending}
				onChange={(e) => handleChange('password', e.target.value)}
				error={errors.password}
				showPassword={showPassword}
				setShowPassword={setShowPassword}
			/>
			<FormComponentPassword
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
			<FormPart>
				<FormElement>
					<div className="flex gap-2">
						<input
							id={elementIds.terms}
							name="terms"
							type="checkbox"
							className={clsx('checkbox', {
								'checkbox-error': errors.terms,
								'checkbox-info': !errors.terms,
							})}
							disabled={pending}
							aria-invalid={!!errors.terms}
							checked={formValues.terms}
							onChange={(e) =>
								handleChange('terms', e.target.checked)
							}
						/>
						<label
							className="flex items-center font-normal"
							htmlFor={elementIds.terms}
						>
							<span className="text-sm text-gray-500 dark:text-base-content">
								I agree with&nbsp;
							</span>
							<Link
								href={RoutesSetup.get('page', {
									label: 'terms-and-conditions',
								})}
								className="link link-info link-hover text-sm"
								target="_blank"
								title="Terms & Conditions"
							>
								terms and conditions
							</Link>
						</label>
						<FormElementError messages={errors.terms} />
					</div>
				</FormElement>
			</FormPart>
			<FormComponentSubmit
				pending={pending}
				submitted={submitted}
				errors={errors}
				buttonLabel="Create account"
				buttonIcon={<Icons.Action.Go />}
			/>
			{state?.situation === 'error' && state.message && (
				<FormError>
					<div>
						<Icons.Status.Error /> {state.message}
					</div>
				</FormError>
			)}
			<FormPart className="text-center">
				<div>
					<span className="text-sm text-gray-500 dark:text-base-content">
						Already registered?{' '}
					</span>
					<Link
						href={RoutesSetup.get('login')}
						className="link link-info link-hover text-sm"
					>
						Sign in here
					</Link>
				</div>
			</FormPart>
		</form>
	);
}
