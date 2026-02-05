'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { Icons } from '@/components/icon.component';
import RoutesSetup from '@/config/routes.setup';
import { UserRoleEnum } from '@/entities/user.model';
import { useTranslation } from '@/hooks/use-translation.hook';
import { useAuth } from '@/providers/auth.provider';

export function UserMenu() {
	const { auth, authStatus } = useAuth();

	const translationsKeys = useMemo(
		() =>
			[
				'users.text.menu_link_login_anchor',
				'users.text.menu_link_login_title',
				'users.text.menu_link_register_anchor',
				'users.text.menu_link_register_title',
				'users.text.menu_link_logout_anchor',
				'users.text.menu_link_logout_title',
				'users.text.menu_link_account_me_anchor',
				'users.text.menu_link_account_me_title',
				'users.text.menu_link_dashboard_anchor',
				'users.text.menu_link_dashboard_title',
			] as const,
		[],
	);

	const { translations, isTranslationLoading } =
		useTranslation(translationsKeys);

	if (authStatus === 'loading' || isTranslationLoading) {
		return <div className="animate-pulse rounded-full bg-gray-300" />;
	}

	return (
		<div className="dropdown dropdown-end dropdown-hover">
			<button type="button">
				<Icons.Entity.User className="cursor-pointer" />
			</button>
			{authStatus === 'unauthenticated' && (
				<ul className="dropdown-content menu bg-base-100 rounded-box z-1 w-36 p-2 shadow-sm">
					<li>
						<Link
							href={RoutesSetup.get('login')}
							title={
								translations['users.text.menu_link_login_title']
							}
						>
							{translations['users.text.menu_link_login_anchor']}
						</Link>
					</li>
					<li>
						<Link
							href={RoutesSetup.get('register')}
							title={
								translations[
									'users.text.menu_link_register_title'
								]
							}
						>
							{
								translations[
									'users.text.menu_link_register_anchor'
								]
							}
						</Link>
					</li>
				</ul>
			)}
			{authStatus === 'authenticated' && (
				<ul className="dropdown-content menu bg-base-100 rounded-box z-1 w-36 p-2 shadow-sm">
					<li>
						<Link
							href={RoutesSetup.get('account-me')}
							title={
								translations[
									'users.text.menu_link_account_me_title'
								]
							}
						>
							{
								translations[
									'users.text.menu_link_account_me_anchor'
								]
							}
						</Link>
					</li>
					{auth?.role &&
						[UserRoleEnum.ADMIN, UserRoleEnum.OPERATOR].includes(
							auth.role,
						) && (
							<li>
								<Link
									href={RoutesSetup.get('dashboard')}
									title={
										translations[
											'users.text.menu_link_dashboard_title'
										]
									}
								>
									{
										translations[
											'users.text.menu_link_dashboard_anchor'
										]
									}
								</Link>
							</li>
						)}
					<li>
						<Link
							href={RoutesSetup.get('logout')}
							prefetch={false}
							title={
								translations[
									'users.text.menu_link_logout_title'
								]
							}
						>
							{translations['users.text.menu_link_logout_anchor']}
						</Link>
					</li>
				</ul>
			)}
		</div>
	);
}
