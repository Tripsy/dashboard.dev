'use client';

import clsx from 'clsx';
import Link from 'next/link';
import type { DropdownChangeEvent } from 'primereact/dropdown';
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
	FormComponentCheckbox,
	FormComponentEmail,
	FormComponentName,
	FormComponentPassword,
	FormComponentRadio,
	FormComponentSelect,
	FormComponentSubmit,
	FormElement,
} from '@/components/form/form-element.component';
import { FormElementError as RawFormElementError } from '@/components/form/form-element-error.component';
import { FormError } from '@/components/form/form-error.component';
import { FormWrapperComponent } from '@/components/form/form-wrapper';
import { Icons } from '@/components/icon.component';
import {
	ErrorComponent,
	ErrorIcon,
	SuccessComponent,
} from '@/components/status.component';
import { Label } from '@/components/ui/label';
import Routes from '@/config/routes.setup';
import { Configuration } from '@/config/settings.config';
import { capitalizeFirstLetter } from '@/helpers/string.helper';
import { useElementIds } from '@/hooks/use-element-ids.hook';
import { useFormValidation } from '@/hooks/use-form-validation.hook';
import { useFormValues } from '@/hooks/use-form-values.hook';
import { LanguageEnum } from '@/models/user.model';

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

	const { errors, submitted, markSubmit, markFieldAsTouched } =
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

	if (state.situation === 'csrf_error') {
		throw new Error(state.message as string);
	}

	if (state.situation === 'pending_account') {
		return (
			<ErrorComponent
				title="Create Account"
				description={state.message as string}
			>
				<div className="text-center mt-6">
					<span className="text-muted-foreground">
						Have you confirmed your email? If you’ve lost the
						instructions, you can resend the{' '}
					</span>
					<Link
						href={Routes.get('email-confirm-send')}
						className="text-primary font-medium hover:underline"
					>
						confirmation email
					</Link>
				</div>
			</ErrorComponent>
		);
	}

	if (state.situation === 'success') {
		return (
			<SuccessComponent
				title="Create Account"
				description="Congratulations! Your account has been created successfully."
			>
				<div className="text-center mt-6">
					<p>
						We&apos;ve sent a verification email to{' '}
						<span className="font-semibold">
							{' '}
							{formValues.email}
						</span>
					</p>
					<p>
						Please check your inbox and click the verification link
						to activate your account.
					</p>
				</div>
				<div className="text-center mt-6">
					Meanwhile you can go back to{' '}
					<Link
						href={Routes.get('home')}
						className="text-primary font-medium hover:underline"
					>
						home page
					</Link>
				</div>
			</SuccessComponent>
		);
	}

	return (
		<FormWrapperComponent
			title="Create your account"
			description="Quick access. Extra benefits. Your gateway to personalized experiences."
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
					fieldName="password"
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
					disabled={pending}
					options={languages}
					onValueChange={(value) => handleChange('language', value)}
					error={errors.language}
				/>

				<FormComponentCheckbox
					id={elementIds.terms}
					onCheckedChange={(checked) =>
						handleChange('terms', checked)
					}
					fieldName="terms"
					checked={formValues.terms}
					disabled={pending}
					error={errors.terms}
				>
					<div>
						<Label
							htmlFor={elementIds.terms}
							className="cursor-pointer text-sm text-muted-foreground"
						>
							I agree to the{' '}
							<Link
								href={Routes.get('page', {
									label: 'terms-and-conditions',
								})}
								className="text-primary font-medium hover:underline"
								target="_blank"
								title="Terms & Conditions"
							>
								Terms of Service
							</Link>{' '}
							and{' '}
							<Link
								href={Routes.get('page', {
									label: 'privacy-policy',
								})}
								className="text-primary font-medium hover:underline"
								target="_blank"
								title="Privacy Policy"
							>
								Privacy Policy
							</Link>
							.
						</Label>
					</div>
				</FormComponentCheckbox>

				<FormComponentSubmit
					pending={pending}
					submitted={submitted}
					errors={errors}
					buttonLabel="Create account"
					buttonIcon={<Icons.Action.Go />}
				/>

				{state.situation === 'error' && state.message && (
					<FormError>
						<div>
							<ErrorIcon /> {state.message}
						</div>
					</FormError>
				)}

				<div className="text-center space-y-2">
					<p className="text-sm text-muted-foreground">
						Already registered?{' '}
						<Link
							href={Routes.get('login')}
							className="text-primary font-medium hover:underline"
						>
							Sign in here
						</Link>
					</p>
				</div>
			</form>
		</FormWrapperComponent>
	);
}
