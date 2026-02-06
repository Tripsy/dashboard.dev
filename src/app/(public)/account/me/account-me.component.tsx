'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { AuthTokenList } from '@/app/(public)/account/login/login.component';
import { Icons } from '@/components/icon.component';
import { Loading } from '@/components/loading.component';
import RoutesSetup from '@/config/routes.setup';
import { formatDate } from '@/helpers/date.helper';
import { capitalizeFirstLetter } from '@/helpers/string.helper';
import { useTranslation } from '@/hooks/use-translation.hook';
import { useAuth } from '@/providers/auth.provider';
import { useToast } from '@/providers/toast.provider';
import { getSessions } from '@/services/account.service';
import type { AuthTokenListType } from '@/types/auth.type';

export default function AccountMe() {
	const { auth, authStatus } = useAuth();
	const { showToast } = useToast();
	const [sessions, setSessions] = useState<AuthTokenListType>([]);

	const translationsKeys = useMemo(
		() =>
			[
				'account_me.message.session_destroy_success',
				'account_me.message.session_destroy_error',
				'account_edit.message.success',
				'account_email_update.message.success',
				'account_password_update.message.success',
			] as const,
		[],
	);

	const { translations, isTranslationLoading } =
		useTranslation(translationsKeys);

	useEffect(() => {
		if (authStatus === 'authenticated') {
			(async () => {
				setSessions(await getSessions());
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
						detail: translations['account_edit.message.success'],
					});
					break;
				case 'emailUpdate':
					showToast({
						severity: 'success',
						summary: 'Success',
						detail: translations[
							'account_email_update.message.success'
						],
					});
					break;
				case 'passwordUpdate':
					showToast({
						severity: 'success',
						summary: 'Success',
						detail: translations[
							'account_password_update.message.success'
						],
					});
					break;
			}

			const newUrl = RoutesSetup.get('account-me');
			router.replace(newUrl, { scroll: false });
		}
	}, [searchParams, showToast, isTranslationLoading, translations, router]);

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

	return (
		<div className="grid grid-cols-1 gap-6">
			{/* Header */}
			<div className="flex justify-between items-center">
				<h1 className="text-center">My Account</h1>
				<Link
					href={RoutesSetup.get('account-edit')}
					prefetch={false}
					title="Edit my account"
					className="btn btn-success btn-sm"
				>
					<Icons.Action.Update />
					Edit
				</Link>
			</div>

			{/* Personal Information */}
			<div className="card bg-base-100 shadow-xl">
				<div className="card-body">
					<h2 className="card-title">
						<Icons.Entity.User />
						Personal Information
					</h2>

					<div className="space-y-4">
						<div className="flex justify-between items-center py-2 border-b border-base-300">
							<div>
								<div className="label label-text font-semibold">
									Full Name
								</div>
								<p className="text-lg">{auth.name}</p>
							</div>
						</div>

						<div className="flex justify-between items-center py-2 border-b border-base-300">
							<div>
								<div className="label label-text font-semibold">
									Email Address
								</div>
								<p className="text-lg">{auth.email}</p>
								{auth.email_verified_at ? (
									<span className="badge badge-success badge-sm mt-1">
										<Icons.Status.Ok />
										Verified
									</span>
								) : (
									<span className="badge badge-warning badge-sm mt-1">
										<Icons.Status.Warning />
										Not Verified
									</span>
									// <a
									// 	className="badge badge-warning badge-sm mt-1"
									// 	href={RoutesSetup.get('email-confirm-send')}
									// 	title="Re-send email verification"
									// >
									// 	<Icons.Status.Warning />
									// 	Not Verified
									// </a>
								)}
							</div>
							<Link
								href={RoutesSetup.get('email-update')}
								className="btn btn-outline btn-sm"
								title="Update email address"
							>
								<Icons.Action.Update />
								Change
							</Link>
						</div>

						<div className="flex justify-between items-center py-2">
							<div>
								<div className="label label-text font-semibold">
									Language preference
								</div>
								<p className="text-lg">
									{capitalizeFirstLetter(auth.language)}
								</p>
							</div>
						</div>

						<div className="flex justify-between items-center py-2">
							<div>
								<div className="label label-text font-semibold">
									Member Since
								</div>
								<p className="text-lg">
									{formatDate(auth.created_at, 'MMMM D, Y')}
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Security & Account */}
			<div className="card bg-base-100 shadow-xl">
				<div className="card-body">
					<h2 className="card-title">
						<Icons.Security />
						Security & Account
					</h2>

					<div className="space-y-4">
						{/* Password Section */}
						<div className="flex justify-between items-center py-2 border-b border-base-300">
							<div>
								<div className="label label-text font-semibold">
									Password
								</div>
								<p className="text-sm text-base-content/70">
									Last updated:{' '}
									{formatDate(
										auth.password_updated_at,
										'date-time',
									)}
								</p>
							</div>
							<Link
								href={RoutesSetup.get('password-update')}
								className="btn btn-outline btn-sm"
								title="Update password"
							>
								<Icons.Password />
								Change
							</Link>
						</div>
					</div>

					{/* Quick Actions */}
					<div className="card-actions justify-end mt-6">
						<Link
							href={RoutesSetup.get('account-delete')}
							className="btn btn-error btn-sm"
						>
							<Icons.Action.Delete />
							Delete Account
						</Link>
					</div>
				</div>
			</div>

			{/* Sessions Management */}
			<div className="card bg-base-200">
				<div className="card-body">
					<h2 className="card-title">
						<Icons.Session />
						Sessions
					</h2>

					<div className="py-2 space-y-4">
						<AuthTokenList
							tokens={sessions}
							callbackAction={(success, message) => {
								showToast({
									severity: success ? 'success' : 'error',
									summary: success ? 'Success' : 'Error',
									detail:
										message === 'session_destroy_success'
											? translations[
													'account_me.message.session_destroy_success'
												]
											: translations[
													'account_me.message.session_destroy_error'
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
