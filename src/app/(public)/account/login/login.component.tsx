'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useActionState, useEffect, useMemo, useState } from 'react';
import {
	loginAction,
	loginValidate,
} from '@/app/(public)/account/login/login.action';
import {
	type LoginFormFieldsType,
	LoginState,
} from '@/app/(public)/account/login/login.definition';
import { FormCsrf } from '@/components/form/form-csrf';
import {
	FormComponentEmail,
	FormComponentPassword,
	FormComponentSubmit,
} from '@/components/form/form-element.component';
import { FormError } from '@/components/form/form-error.component';
import { FormPart } from '@/components/form/form-part.component';
import { Icons } from '@/components/icon.component';
import RoutesSetup, { isExcludedRoute } from '@/config/routes.setup';
import { Configuration } from '@/config/settings.config';
import { formatDate } from '@/helpers/date.helper';
import { useElementIds } from '@/hooks/use-element-ids.hook';
import { useFormValidation } from '@/hooks/use-form-validation.hook';
import { useFormValues } from '@/hooks/use-form-values.hook';
import { useTranslation } from '@/hooks/use-translation.hook';
import { useAuth } from '@/providers/auth.provider';
import { useToast } from '@/providers/toast.provider';
import { removeTokenAccount } from '@/services/account.service';
import type { AuthTokenListType, AuthTokenType } from '@/types/auth.type';

export default function Login() {
	const { showToast } = useToast();
	const [state, action, pending] = useActionState(loginAction, LoginState);
	const [showPassword, setShowPassword] = useState(false);

	const { refreshAuth } = useAuth();

	const router = useRouter();
	const searchParams = useSearchParams();

	const [formValues, setFormValues] = useFormValues<LoginFormFieldsType>(
		state.values,
	);

	const { errors, submitted, setSubmitted, markFieldAsTouched } =
		useFormValidation({
			formValues: formValues,
			validate: loginValidate,
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

	const handleChange = (
		name: keyof LoginFormFieldsType,
		value: string | boolean | number | Date,
	) => {
		setFormValues((prev) => ({ ...prev, [name]: value }));
		markFieldAsTouched(name);
	};

	useEffect(() => {
		if (state?.situation === 'success' && router) {
			(async () => {
				await refreshAuth();
			})();

			// Get the original destination from query params
			const fromParam = searchParams.get('from');

			let redirectUrl = RoutesSetup.get('home');

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
	}, [state?.situation, router, refreshAuth, searchParams.get]);

	const elementIds = useElementIds(['email', 'password']);

	if (state?.situation === 'csrf_error') {
		return (
			<div className="form-section">
				<h1 className="text-center">Sign In</h1>

				<div className="text-sm text-error">
					<Icons.Status.Error /> {state.message}
				</div>
			</div>
		);
	}

	if (state?.situation === 'pending_account') {
		return (
			<div className="form-section">
				<h1 className="text-center">Sign In</h1>

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

	return (
		<form
			action={action}
			onSubmit={() => setSubmitted(true)}
			className="form-section"
		>
			<FormCsrf
				inputName={Configuration.get('csrf.inputName') as string}
			/>

			<h1 className="text-center">Sign In</h1>

			<FormPart className="text-sm text-center md:max-w-xs">
				<span>Secure login. Resume your personalized experience.</span>
			</FormPart>

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
				buttonLabel="Login"
				buttonIcon={<Icons.Action.Login />}
			/>

			{state?.situation === 'error' && state.message && (
				<FormError>
					<div>
						<Icons.Status.Error /> {state.message}
					</div>
				</FormError>
			)}

			{state?.situation === 'max_active_sessions' && state.message && (
				<FormPart>
					<div className="space-y-4">
						<div className="text-error text-sm">
							<Icons.Status.Error /> {state.message}
						</div>

						<AuthTokenList
							tokens={state.body?.authValidTokens || []}
							callbackAction={(success, message) => {
								showToast({
									severity: success ? 'success' : 'error',
									summary: success ? 'Success' : 'Error',
									detail:
										message === 'session_destroy_success'
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
				</FormPart>
			)}

			<FormPart className="text-center">
				<div>
					<div className="mb-2">
						<span className="text-sm text-gray-500 dark:text-base-content">
							Not registered yet?{' '}
						</span>
						<Link
							href={RoutesSetup.get('register')}
							className="link link-info link-hover text-sm"
						>
							Create an account
						</Link>
					</div>
					<div>
						<span className="text-sm text-gray-500 dark:text-base-content">
							Forgot your password?{' '}
						</span>
						<Link
							href={RoutesSetup.get('password-recover')}
							className="link link-info link-hover text-sm"
						>
							Reset it here
						</Link>
					</div>
				</div>
			</FormPart>
		</form>
	);
}

export const AuthTokenList = ({
	callbackAction,
	tokens,
}: {
	callbackAction: (success: boolean, message: string) => void;
	tokens: AuthTokenListType | [];
}) => {
	const [selectedToken, setSelectedToken] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const [tokenList, setTokenList] = useState<AuthTokenListType>([
		...(tokens || []),
	]);

	useEffect(() => {
		setTokenList([...tokens]);
	}, [tokens]);

	const handleConfirmDestroy = async () => {
		if (!selectedToken) {
			return;
		}

		try {
			setLoading(true);

			await removeTokenAccount(selectedToken);

			callbackAction(true, 'session_destroy_success');

			setTokenList((prev) =>
				prev.filter((token) => token.ident !== selectedToken),
			);
		} catch {
			callbackAction(false, 'session_destroy_error');
		} finally {
			setLoading(false);
			setSelectedToken(null);
		}
	};

	const selectedTokenData: AuthTokenType | undefined = useMemo(
		() => tokenList.find((token) => token.ident === selectedToken),
		[selectedToken, tokenList],
	);

	return (
		<>
			{tokenList.map((token: AuthTokenType) => (
				<div key={token.ident} className="card bg-base-100 shadow-xl">
					<div className="card-body">
						<div className="text-sm">{token.label}</div>
						<div className="text-xs mt-1">
							Last used: {formatDate(token.used_at, 'date-time')}
						</div>
						<div className="card-actions">
							{token.used_now ? (
								<div className="mt-2 btn btn-success btn-sm border-none cursor-default">
									<Icons.Status.Active /> Active Session
								</div>
							) : (
								<button
									type="button"
									className="mt-2 btn btn-neutral btn-sm border-none hover:bg-error"
									onClick={() =>
										setSelectedToken(token.ident)
									}
								>
									<Icons.Action.Destroy /> Destroy Session
								</button>
							)}
						</div>
					</div>
				</div>
			))}

			{selectedToken && (
				<div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
					<div className="bg-base-200 p-4 md:p-8 rounded-md shadow-xl max-w-sm w-full">
						<p className="text-sm semi-bold">
							Are you sure you want to destroy the session?
						</p>
						<p className="font-mono text-xs break-words mt-2">
							{selectedTokenData?.label}
						</p>
						<div className="flex justify-end gap-2 mt-4">
							<button
								type="button"
								className="btn btn-neutral"
								onClick={() => setSelectedToken(null)}
								disabled={loading}
							>
								Cancel
							</button>
							<button
								type="button"
								className="btn btn-success"
								onClick={handleConfirmDestroy}
								disabled={loading}
							>
								{loading ? 'Deleting...' : 'Confirm'}
							</button>
						</div>
					</div>
				</div>
			)}
		</>
	);
};
