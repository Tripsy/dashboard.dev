'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useActionState, useEffect, useMemo, useState } from 'react';
import { AuthTokenList } from '@/app/(public)/_components/auth-token-list.component';
import { loginAction } from '@/app/(public)/account/login/login.action';
import {
	isLoginResponseMaxActiveSessions,
	type LoginFormValuesType,
	LoginState,
	validateFormLogin,
} from '@/app/(public)/account/login/login.definition';
import { FormCsrf } from '@/components/form/form-csrf';
import {
	FormComponentEmail,
	FormComponentPassword,
	FormComponentSubmit,
} from '@/components/form/form-element.component';
import { FormError } from '@/components/form/form-error.component';
import { FormWrapperComponent } from '@/components/form/form-wrapper';
import { Icons } from '@/components/icon.component';
import { ErrorComponent, ErrorIcon } from '@/components/status.component';
import Routes, { isExcludedRoute } from '@/config/routes.setup';
import { createHandleChange } from '@/helpers/form.helper';
import { useElementIds } from '@/hooks/use-element-ids.hook';
import { useFormValidation } from '@/hooks/use-form-validation.hook';
import { useFormValues } from '@/hooks/use-form-values.hook';
import { useTranslation } from '@/hooks/use-translation.hook';
import { useAuth } from '@/providers/auth.provider';
import { useToast } from '@/providers/toast.provider';

export default function Login() {
	const [showPassword, setShowPassword] = useState(false);
	const { showToast } = useToast();

	const { refreshAuth } = useAuth();
	const router = useRouter();
	const searchParams = useSearchParams();

	const [state, action, pending] = useActionState(loginAction, LoginState);

	const [formValues, setFormValues] = useFormValues<LoginFormValuesType>(
		state.values,
	);

	const { errors, submitted, markSubmit, markFieldAsTouched } =
		useFormValidation({
			formValues: formValues,
			validateForm: validateFormLogin,
			debounceDelay: 800,
		});

	const translationsKeys = useMemo(
		() =>
			[
				'login.message.session_destroy_success',
				'login.message.session_destroy_error',
			] as const,
		[],
	);

	const { translations } = useTranslation(translationsKeys);

	const handleChange = createHandleChange(setFormValues, markFieldAsTouched);

	useEffect(() => {
		if (state.situation === 'success') {
			(async () => {
				await refreshAuth();
			})();

			// Get the original destination from query params
			const fromParam = searchParams.get('from');

			let redirectUrl = Routes.get('home');

			if (fromParam) {
				const decodedFrom = decodeURIComponent(fromParam);

				// Parse the decoded URL to extract just the pathname
				const url = new URL(decodedFrom, window.location.origin);
				const pathname = url.pathname;

				// Check only the pathname against excluded routes
				if (!isExcludedRoute(pathname)) {
					redirectUrl = url.toString();
				}
			}

			router.replace(redirectUrl);
		}
	}, [state.situation, router, refreshAuth, searchParams]);

	const elementIds = useElementIds(['email', 'password'] as const);

	if (state.situation === 'csrf_error') {
		throw new Error(state.message as string);
	}

	if (state.situation === 'pending_account') {
		return (
			<ErrorComponent title="Login" description={state.message as string}>
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

	const authTokens =
		state.resultData && isLoginResponseMaxActiveSessions(state.resultData)
			? state.resultData.authTokens
			: undefined;

	return (
		<FormWrapperComponent
			title="Welcome back"
			description="Sign in to your account to continue"
		>
			<form
				action={action}
				onSubmit={markSubmit}
				className="form-section"
			>
				<FormCsrf />

				<FormComponentEmail<LoginFormValuesType>
					labelText="Email Address"
					id={elementIds.email}
					fieldValue={formValues.email ?? ''}
					disabled={pending}
					onChange={(e) => handleChange('email', e.target.value)}
					error={errors.email}
				/>

				<FormComponentPassword<LoginFormValuesType>
					labelText="Password"
					id={elementIds.password}
					fieldName="password"
					fieldValue={formValues.password ?? ''}
					autoComplete="current-password"
					disabled={pending}
					onChange={(e) => handleChange('password', e.target.value)}
					error={errors.password}
					showPassword={showPassword}
					setShowPassword={setShowPassword}
				/>

				<FormComponentSubmit
					pending={pending}
					submitted={submitted}
					errors={errors}
					button={{
						label: 'Login',
						iconLabel: 'login',
					}}
				/>

				{state.situation === 'error' && state.message && (
					<FormError>
						<div className="flex items-center gap-1.5">
							<Icons.Status.Error />
							<div>{state.message}</div>
						</div>
					</FormError>
				)}

				{state.situation === 'max_active_sessions' &&
					state.message &&
					authTokens && (
						<div className="space-y-4">
							<div className="text-error text-sm">
								<ErrorIcon /> {state.message}
							</div>

							<AuthTokenList
								tokens={authTokens}
								onResult={(success, message) => {
									showToast({
										severity: success ? 'success' : 'error',
										summary: success ? 'Success' : 'Error',
										detail:
											message ===
											'session_destroy_success'
												? translations[
														'login.message.session_destroy_success'
													]
												: translations[
														`login.message.session_destroy_error`
													],
									});
								}}
							/>
						</div>
					)}

				<div className="text-center space-y-2">
					<p className="text-sm text-muted-foreground">
						Don't have an account?{' '}
						<Link
							href={Routes.get('register')}
							className="text-primary font-medium hover:underline"
						>
							Create an account
						</Link>
					</p>
					<p className="text-sm text-muted-foreground">
						Forgot your password?{' '}
						<Link
							href={Routes.get('password-recover')}
							className="text-primary font-medium hover:underline"
						>
							Reset it here
						</Link>
					</p>
				</div>
			</form>
		</FormWrapperComponent>
	);
}
