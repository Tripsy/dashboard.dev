'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { AuthTokenList } from '@/app/(public)/_components/auth-token-list.component';
import { Icons } from '@/components/icon.component';
import { LogoComponent } from '@/components/layout/logo.default';
import { LoadingComponent } from '@/components/status.component';
import { Badge } from '@/components/ui/badge';
import { Link } from '@/components/ui/link';
import Routes from '@/config/routes.setup';
import { formatDate } from '@/helpers/date.helper';
import { useTranslation } from '@/hooks/use-translation.hook';
import { useAuth } from '@/providers/auth.provider';
import { useToast } from '@/providers/toast.provider';
import { requestGetSessions } from '@/services/account.service';
import type { AuthTokenType } from '@/types/auth.type';

export default function AccountMe() {
	const { auth, authStatus } = useAuth();
	const { showToast } = useToast();
	const [sessions, setSessions] = useState<AuthTokenType[]>([]);

	const translationsKeys = useMemo(
		() =>
			[
				'account-me.message.session_destroy_success',
				'account-me.message.session_destroy_error',
				'account-edit.message.success',
				'account-email-update.message.success',
				'account-password-update.message.success',
			] as const,
		[],
	);

	const { translations, isTranslationLoading } =
		useTranslation(translationsKeys);

	useEffect(() => {
		if (authStatus === 'authenticated') {
			(async () => {
				setSessions(await requestGetSessions());
			})();
		}
	}, [authStatus]);

	const router = useRouter();
	const searchParams = useSearchParams();

	useEffect(() => {
		const fromParam = searchParams.get('from');

		if (fromParam && !isTranslationLoading) {
			switch (fromParam) {
				case 'edit':
					showToast({
						severity: 'success',
						summary: 'Success',
						detail: translations['account-edit.message.success'],
					});
					break;
				case 'emailUpdate':
					showToast({
						severity: 'success',
						summary: 'Success',
						detail: translations[
							'account-email-update.message.success'
						],
					});
					break;
				case 'passwordUpdate':
					showToast({
						severity: 'success',
						summary: 'Success',
						detail: translations[
							'account-password-update.message.success'
						],
					});
					break;
			}

			const newUrl = Routes.get('account-me');
			router.replace(newUrl, { scroll: false });
		}
	}, [searchParams, showToast, isTranslationLoading, translations, router]);

	if (authStatus === 'loading') {
		return <LoadingComponent />;
	}

	if (!auth) {
		router.replace(Routes.get('login'));
		return null;
	}

	return (
		<div className="min-h-[calc(80vh-4rem)] px-4 py-12">
			<div className="text-center mb-8">
				<div className="flex justify-center mb-4">
					<LogoComponent />
				</div>
				<h1 className="text-2xl font-bold mb-2">My Account</h1>
			</div>

			<div className="flex flex-wrap justify-center gap-8">
				{/* Personal Information */}
				<div className="bg-card border border-border rounded-xl p-6 shadow-xl space-y-4 w-full max-w-md">
					<div className="flex justify-between items-center">
						<h2 className="text-lg font-bold flex items-center gap-2">
							<Icons.User />
							Personal Information
						</h2>
						<Link
							href={Routes.get('account-edit')}
							prefetch={false}
							title="Edit my account"
							variant="outline"
							size="sm"
						>
							<Icons.Action.Update /> Edit
						</Link>
					</div>

					<div className="border-b pb-4">
						<div className="text-sm text-muted-foreground font-semibold">
							Full Name
						</div>
						<p>{auth.name}</p>
					</div>

					<div className="border-b pb-4">
						<div className="flex justify-between">
							<div>
								<div className="text-sm text-muted-foreground font-semibold">
									Email Address
								</div>
								<p>{auth.email}</p>
								{auth.email_verified_at ? (
									<Badge
										variant="success"
										size="sm"
										className="rounded-lg mt-2"
									>
										<Icons.Status.Ok className="w-4 h-4" />
										Verified
									</Badge>
								) : (
									<Badge
										variant="error"
										size="sm"
										className="rounded-lg mt-2"
									>
										<Icons.Status.Warning className="w-4 h-4" />
										Not Verified
									</Badge>
								)}
							</div>
							<Link
								href={Routes.get('email-update')}
								prefetch={false}
								title="Update email address"
								variant="outline"
								size="sm"
							>
								<Icons.Action.Update /> Change
							</Link>
						</div>
					</div>

					<div className="border-b pb-4">
						<div className="text-sm text-muted-foreground font-semibold">
							Language
						</div>
						<p>{auth.language}</p>
					</div>

					<div>
						<div className="text-sm text-muted-foreground font-semibold">
							Member Since
						</div>
						<p>
							{formatDate(auth.created_at, undefined, {
								customFormat: 'MMMM D, YYYY',
							})}
						</p>
					</div>
				</div>

				{/* Security & Account */}
				<div className="bg-card border border-border rounded-xl p-6 shadow-xl space-y-4 w-full max-w-md">
					<h2 className="text-lg font-bold flex items-center gap-2">
						<Icons.Security />
						Security & Account
					</h2>

					<div className="border-b pb-4">
						<div className="flex justify-between">
							<div>
								<div className="text-sm text-muted-foreground font-semibold">
									Password
								</div>
								<p className="text-xs italic">
									Last updated:{' '}
									{formatDate(
										auth.password_updated_at,
										undefined,
										{
											customFormat: 'D MMMM YYYY, h:mm A',
										},
									)}
								</p>
							</div>
							<Link
								href={Routes.get('password-update')}
								prefetch={false}
								title="Update password"
								variant="outline"
								size="sm"
							>
								<Icons.Password /> Change
							</Link>
						</div>
					</div>

					<div className="flex justify-end mt-6">
						<Link
							href={Routes.get('account-delete')}
							prefetch={false}
							title="Delete my account"
							variant="error"
							size="sm"
						>
							<Icons.Action.Delete /> Delete Account
						</Link>
					</div>
				</div>

				{/* Sessions Management */}
				<div className="bg-card border border-border rounded-xl p-6 shadow-xl space-y-4 w-full max-w-md">
					<h2 className="text-lg font-bold flex items-center gap-2">
						<Icons.Session />
						Sessions
					</h2>

					<div className="py-2 space-y-4">
						<AuthTokenList
							tokens={sessions}
							onResult={(success, message) => {
								showToast({
									severity: success ? 'success' : 'error',
									summary: success ? 'Success' : 'Error',
									detail:
										message === 'session_destroy_success'
											? translations[
													'account-me.message.session_destroy_success'
												]
											: translations[
													'account-me.message.session_destroy_error'
												],
								});
							}}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
