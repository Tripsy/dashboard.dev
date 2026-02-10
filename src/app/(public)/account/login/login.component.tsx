'use client';

import { ArrowDownRight } from 'lucide-react';
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
import { FormWrapperComponent } from '@/components/form/form-wrapper';
import { Icons } from '@/components/icon.component';
import { ErrorComponent, ErrorIcon } from '@/components/status.component';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import Routes, { isExcludedRoute } from '@/config/routes.setup';
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

	const { errors, submitted, markSubmit, markFieldAsTouched } =
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
		if (state.situation === 'success' && router) {
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

	const elementIds = useElementIds(['email', 'password']);

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

				{state.situation === 'error' && state.message && (
					<FormError>
						<div>
							<ErrorIcon /> {state.message}
						</div>
					</FormError>
				)}

				{state.situation === 'max_active_sessions' && state.message && (
					<div className="space-y-4">
						<div className="text-error text-sm">
							<ErrorIcon /> {state.message}
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
				<div key={token.ident} className="pb-4">
					<div className="text-sm">
						<ArrowDownRight className="h-4 w-4" />
						{token.label}
					</div>
					<div className="flex justify-between items-center">
						<div className="text-xs mt-1">
							Last used: {formatDate(token.used_at, 'date-time')}
						</div>
						{token.used_now ? (
							<Badge variant="success" size="xs">
								<Icons.Status.Active /> Active Session
							</Badge>
						) : (
							<Button
								variant="error"
								size="xs"
								onClick={() => setSelectedToken(token.ident)}
							>
								<Icons.Action.Destroy /> Destroy Session
							</Button>
						)}
					</div>
				</div>
			))}

			{selectedToken && (
				<Modal
					isOpen={true}
					onClose={() => setSelectedToken(null)}
					title="Destroy session"
					footer={
						<>
							<Button
								variant="error"
								size="sm"
								onClick={handleConfirmDestroy}
								disabled={loading}
							>
								{loading ? 'Deleting...' : 'Confirm'}
							</Button>
							<Button
								variant="outline"
								size="sm"
								onClick={() => setSelectedToken(null)}
								disabled={loading}
							>
								Cancel
							</Button>
						</>
					}
				>
					<p className="text-sm semi-bold">
						Are you sure you want to destroy the session?
					</p>
					<p className="font-mono text-xs break-words mt-2">
						{selectedTokenData?.label}
					</p>
				</Modal>
			)}
		</>
	);
};
