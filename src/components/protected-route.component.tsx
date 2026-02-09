'use client';

import { usePathname, useRouter } from 'next/navigation';
import type React from 'react';
import { useEffect, useMemo } from 'react';
import {
	ErrorComponent,
	LoadingComponent,
} from '@/components/status.component';
import Routes, { RouteAuth } from '@/config/routes.setup';
import { useTranslation } from '@/hooks/use-translation.hook';
import { hasPermission } from '@/models/auth.model';
import { useAuth } from '@/providers/auth.provider';

type ProtectedRouteProps = {
	children: React.ReactNode;
	routeAuth: RouteAuth;
	routePermission?: string;
	className?: string;
	fallback?: React.ReactNode;
};

const ProtectedRouteWrapper = ({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) => {
	return <div className={className}>{children}</div>;
};

export default function ProtectedRoute({
	children,
	routeAuth,
	routePermission,
	className,
	fallback,
}: ProtectedRouteProps) {
	const { authStatus, auth } = useAuth();

	const router = useRouter();
	const pathname = usePathname();

	// Redirect to the login page if not authenticated, and route is protected or authenticated
	useEffect(() => {
		if (
			[RouteAuth.AUTHENTICATED, RouteAuth.PROTECTED].includes(
				routeAuth,
			) &&
			authStatus === 'unauthenticated'
		) {
			router.push(
				`${Routes.get('login')}?from=${encodeURIComponent(pathname)}`,
			);
		}
	}, [authStatus, pathname, routeAuth, router]);

	const translationsKeys = useMemo(
		() =>
			[
				'app.text.loading',
				'auth.message.already_logged_in',
				'auth.message.unauthorized',
			] as const,
		[],
	);

	const { translations, isTranslationLoading } =
		useTranslation(translationsKeys);

	const permission = useMemo(() => {
		if (routePermission) {
			return routePermission;
		}

		if (
			routeAuth === RouteAuth.PROTECTED &&
			authStatus === 'authenticated'
		) {
			return Routes.match(pathname)?.props?.permission;
		}

		return undefined;
	}, [routePermission, routeAuth, authStatus, pathname]);

	// Loading
	if (isTranslationLoading) {
		return <LoadingComponent text={translations['app.text.loading']} />;
	}

	// Is a public route so return content
	if (routeAuth === RouteAuth.PUBLIC) {
		return <>{children}</>;
	}

	// Loading
	if (authStatus === 'loading') {
		return <LoadingComponent text={translations['app.text.loading']} />;
	}

	if (
		routeAuth === RouteAuth.UNAUTHENTICATED &&
		authStatus === 'authenticated'
	) {
		return (
			<ProtectedRouteWrapper className={className}>
				<ErrorComponent
					description={translations['auth.message.already_logged_in']}
				>
					{fallback}
				</ErrorComponent>
			</ProtectedRouteWrapper>
		);
	}

	// If this is a protected route and the user doesn't have the required permission
	if (routeAuth === RouteAuth.PROTECTED && !hasPermission(auth, permission)) {
		return (
			<ProtectedRouteWrapper className={className}>
				<ErrorComponent
					description={translations['auth.message.unauthorized']}
				>
					{fallback}
				</ErrorComponent>
			</ProtectedRouteWrapper>
		);
	}

	return <>{children}</>;
}
