import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import RoutesSetup, { RouteAuth, type RouteMatch } from '@/config/routes.setup';
import { Configuration } from '@/config/settings.config';
import { ApiRequest, getResponseData } from '@/helpers/api.helper';
import { getTrackedCookie } from '@/helpers/session.helper';
import { apiHeaders } from '@/helpers/system.helper';
import {
	type AuthModel,
	hasPermission,
	prepareAuthModel,
} from '@/models/auth.model';
import type { ApiResponseFetch } from '@/types/api.type';

class MiddlewareContext {
	req: NextRequest;
	res: NextResponse;

	constructor(req: NextRequest) {
		this.req = req;
		this.res = NextResponse.next();
	}

	success() {
		// MIME sniffing protection
		this.res.headers.set('X-Content-Type-Options', 'nosniff');

		// Clickjacking protection
		this.res.headers.set('X-Frame-Options', 'DENY');

		// Determine language; add it to headers; create the cookie
		this.setupLanguage();

		return this.res;
	}

	redirect(url: URL) {
		return NextResponse.redirect(url);
	}

	redirectToLogin() {
		// Create the full destination URL with all query params
		const currentUrl = new URL(this.req.url);
		const destinationPath = currentUrl.pathname + currentUrl.search;

		// Create the login URL
		const loginUrl = new URL(RoutesSetup.get('login'), this.req.url);

		// Set from query parameter as `destinationPath`
		loginUrl.searchParams.set('from', encodeURIComponent(destinationPath));

		return this.redirect(loginUrl);
	}

	redirectToError(r: string) {
		const redirectUrl = new URL(
			RoutesSetup.get('status', { type: 'error' }),
			this.req.url,
		);

		redirectUrl.searchParams.set('r', r);

		return this.redirect(redirectUrl);
	}

	setupLanguage() {
		// 1. Check query parameter first (the highest priority)
		const url = new URL(this.req.url);
		const queryLang = url.searchParams.get('lang');

		// 2. Check existing cookie
		const cookieLang = this.req.cookies.get('preferred-language')?.value;

		// 3. Check Accept-Language header
		const acceptLanguage = this.req.headers.get('accept-language');
		const headerLang = acceptLanguage?.split(',')[0]?.split('-')[0];

		// Determine language with priority: query > cookie > header
		const language = queryLang || cookieLang || headerLang;

		if (language && Configuration.isSupportedLanguage(language)) {
			if (language !== cookieLang) {
				this.res.cookies.set('preferred-language', language, {
					httpOnly: true,
					secure: Configuration.isEnvironment('production'),
					path: '/',
					sameSite: 'lax',
					maxAge: 60 * 60 * 24 * 365,
				});
			}

			this.res.headers.set('x-language', language);
		}
	}

	isValidOrigin() {
		const origin = this.req.headers.get('origin');
		const referer = this.req.headers.get('referer');

		const allowedOrigins = Configuration.get(
			'security.allowedOrigins',
		) as string[];

		// Probably a same-origin browser request — allow it
		if (!origin && !referer) {
			return true;
		}

		// Check origin
		if (origin && allowedOrigins.includes(origin)) {
			return true;
		}

		if (referer) {
			try {
				const refererUrl = new URL(referer || '');

				return allowedOrigins.includes(
					`${refererUrl.protocol}//${refererUrl.host}`,
				);
			} catch {
				return false;
			}
		}

		return false;
	}

	destroySession() {
		this.res.cookies.delete(
			Configuration.get('user.sessionToken') as string,
		);
	}

	async handleAuth(
		routeMatch: RouteMatch | undefined,
	): Promise<NextResponse> {
		const sessionToken = await getTrackedCookie(
			Configuration.get('user.sessionToken') as string,
		);

		const { auth: routeAuth, permission: routePermission } =
			routeMatch?.props || {
				auth: RouteAuth.PUBLIC,
				permission: undefined,
			};

		if (!sessionToken.value) {
			switch (routeAuth) {
				case RouteAuth.UNAUTHENTICATED:
				case RouteAuth.PUBLIC:
					return this.success();
				case RouteAuth.AUTHENTICATED:
				case RouteAuth.PROTECTED:
					return this.redirectToLogin();
				default:
					return this.redirectToError('undefined_route');
			}
		}

		const authModel = await fetchAuthModel(sessionToken.value);

		if (!authModel) {
			switch (routeAuth) {
				case RouteAuth.UNAUTHENTICATED:
				case RouteAuth.PUBLIC: {
					// Destroy session -> token exists but is invalid
					this.destroySession();

					return this.success();
				}
				case RouteAuth.AUTHENTICATED:
				case RouteAuth.PROTECTED: {
					this.res = this.redirectToError('unauthorized');

					// Destroy session -> token exists but is invalid
					this.destroySession();

					return this.res;
				}
				default: {
					return this.redirectToError('undefined_route');
				}
			}
		}

		if (routeAuth === RouteAuth.UNAUTHENTICATED) {
			return this.redirectToError('already_logged_in');
		}

		if (routeAuth === RouteAuth.PROTECTED) {
			if (!hasPermission(authModel, routePermission)) {
				return this.redirectToError('unauthorized');
			}
		}

		this.res.headers.set('x-auth-data', JSON.stringify(authModel));

		if (sessionToken.action === 'set' && sessionToken.value) {
			const cookieName = Configuration.get('user.sessionToken') as string;
			const cookieMaxAge = Configuration.get(
				'user.sessionMaxAge',
			) as number;

			this.res.cookies.set(cookieName, sessionToken.value, {
				httpOnly: true,
				secure: Configuration.isEnvironment('production'),
				path: '/',
				sameSite: 'lax',
				maxAge: cookieMaxAge,
			});

			const cookieExpireValue = Date.now() + cookieMaxAge * 1000;

			this.res.cookies.set(
				`${cookieName}-expiration`,
				String(cookieExpireValue),
				{
					httpOnly: true,
					secure: Configuration.isEnvironment('production'),
					path: '/',
					sameSite: 'lax',
					maxAge: cookieMaxAge,
				},
			);
		}

		return this.success();
	}
}

/**
 * Fetches auth model
 *
 * Note:
 *    - Do not throw errors from this method as it will break the middleware flow
 *
 * @param token
 */
async function fetchAuthModel(token: string): Promise<AuthModel> {
	try {
		const fetchResponse: ApiResponseFetch<AuthModel> =
			await new ApiRequest()
				.setRequestMode('remote-api')
				.doFetch('/account/me', {
					method: 'GET',
					headers: {
						Authorization: `Bearer ${token}`,
						...(await apiHeaders()),
					},
				});

		if (fetchResponse?.success) {
			const responseData = getResponseData(fetchResponse);

			if (responseData) {
				return prepareAuthModel(responseData);
			}
		}

		return null;
	} catch {
		return null;
	}
}

export async function proxy(req: NextRequest) {
	const ctx = new MiddlewareContext(req);

	// Skip middleware for Server Actions
	if (req.headers.get('next-action')) {
		return ctx.success();
	}

	// Skip preflight and HEAD requests
	if (['HEAD', 'OPTIONS'].includes(req.method)) {
		return ctx.success();
	}

	// Block suspicious origins
	if (!ctx.isValidOrigin()) {
		return new NextResponse('Forbidden', {
			status: 403,
		});
	}

	const pathname = req.nextUrl.pathname;
	const routeMatch = RoutesSetup.match(pathname);

	if (!routeMatch) {
		return ctx.success();
	}

	// Skip auth check for proxy routes - they will fail at remote API if is the case
	if (!['proxy'].includes(routeMatch.name)) {
		return await ctx.handleAuth(routeMatch);
	}

	return ctx.success();
}

export const config = {
	matcher: [
		'/((?!_next/static|_next/image|favicon.ico|.*\\.(?:ico|png|jpg|jpeg|svg|css|js|json|woff2?|ttf|eot)).*)',
	],
};
