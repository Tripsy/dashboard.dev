import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import Routes, { RouteAuthEnum, type RouteMatch } from '@/config/routes.setup';
import { Configuration } from '@/config/settings.config';
import { ApiError } from '@/exceptions/api.error';
import { ApiRequest, getResponseData } from '@/helpers/api.helper';
import {
	getCachedAuthModel,
	setCachedAuthModel,
} from '@/helpers/auth-cache.helper';
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
		const loginUrl = new URL(Routes.get('login'), this.req.url);

		// Set from query parameter as `destinationPath`
		loginUrl.searchParams.set('from', encodeURIComponent(destinationPath));

		return this.redirect(loginUrl);
	}

	redirectToError(r: string) {
		const redirectUrl = new URL(
			Routes.get('status', { type: 'error' }),
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
		const cookieLang = this.req.cookies.get(
			Configuration.get('language.cookieName'),
		)?.value;

		// 3. Check Accept-Language header
		const acceptLanguage = this.req.headers.get('accept-language');
		const headerLang = acceptLanguage?.split(',')[0]?.split('-')[0];

		// Determine language with priority: query > cookie > header
		const language = queryLang || cookieLang || headerLang;

		if (language && Configuration.isSupportedLanguage(language)) {
			const languageCookie = Configuration.get('language.cookieName');
			const languageCookieMaxAge = Configuration.get(
				'language.cookieMaxAge',
			);

			if (language !== cookieLang) {
				this.res.cookies.set(languageCookie, language, {
					maxAge: languageCookieMaxAge,
					path: '/',
					sameSite: 'lax',
					secure: Configuration.isEnvironment('production'),
					httpOnly: true,
				});
			}

			this.res.headers.set('x-language', language);
		}
	}

	isValidRequestSource() {
		// Primary defense: Sec-Fetch-Site is a browser-set *forbidden* header —
		// JavaScript cannot forge it — so it's a stronger CSRF signal than
		// Origin/Referer. Present on all evergreen browsers. A state-changing
		// request from our own SPA is always `same-origin`; `cross-site` (and the
		// direct-navigation `none`) have no legitimate mutating caller here.
		const secFetchSite = this.req.headers.get('sec-fetch-site');

		if (secFetchSite) {
			return (
				secFetchSite === 'same-origin' || secFetchSite === 'same-site'
			);
		}

		// Fallback for non-browser / legacy clients that omit Sec-Fetch-Site:
		// the original Origin/Referer allowlist check.
		const origin = this.req.headers.get('origin');
		const referer = this.req.headers.get('referer');

		const allowedOrigins = Configuration.get('security.allowedOrigins');

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
		if (Configuration.isEnvironment('production')) {
			this.res.cookies.delete(Configuration.get('user.sessionToken'));
		}
	}

	async handleAuth(
		routeMatch: RouteMatch | undefined,
	): Promise<NextResponse> {
		const sessionToken = await getTrackedCookie(
			Configuration.get('user.sessionToken'),
			Configuration.get('user.sessionRefreshThreshold'),
		);

		const {
			auth: routeAuth,
			permissionEntity,
			permissionOperation,
		} = routeMatch?.props || {
			auth: RouteAuthEnum.PUBLIC,
			permissionEntity: undefined,
			permissionOperation: undefined,
		};

		if (!sessionToken.value) {
			switch (routeAuth) {
				case RouteAuthEnum.UNAUTHENTICATED:
				case RouteAuthEnum.PUBLIC:
					return this.success();
				case RouteAuthEnum.AUTHENTICATED:
				case RouteAuthEnum.PROTECTED:
					return this.redirectToLogin();
				default:
					return this.redirectToError('undefined_route');
			}
		}

		const authResult = await resolveAuthModel(sessionToken.value); // null = invalid token, false = server error

		if (authResult === null) {
			switch (routeAuth) {
				case RouteAuthEnum.UNAUTHENTICATED:
				case RouteAuthEnum.PUBLIC: {
					// Destroy session -> token exists but is invalid
					this.destroySession();

					return this.success();
				}
				case RouteAuthEnum.AUTHENTICATED:
				case RouteAuthEnum.PROTECTED: {
					this.res = this.redirectToError('unauthorized');

					// Destroy session -> token exists but is invalid
					this.destroySession();

					return this.res;
				}
				default: {
					return this.redirectToError('undefined_route');
				}
			}
		} else if (authResult === false) {
			// server is down, don't punish the user's session
			return this.redirectToError('service_unavailable');
		}

		if (routeAuth === RouteAuthEnum.UNAUTHENTICATED) {
			return this.redirectToError('already_logged_in');
		}

		if (routeAuth === RouteAuthEnum.PROTECTED) {
			if (
				!permissionEntity ||
				!hasPermission(
					authResult,
					permissionEntity,
					permissionOperation,
				)
			) {
				return this.redirectToError('unauthorized');
			}
		}

		this.res.headers.set('x-auth-data', JSON.stringify(authResult));

		if (sessionToken.action === 'set' && sessionToken.value) {
			const cookieName = Configuration.get('user.sessionToken');
			const cookieMaxAge = Configuration.get('user.sessionMaxAge');

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
async function fetchAuthModel(
	token: string,
): Promise<AuthModel | null | false> {
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
	} catch (error) {
		if (error instanceof ApiError && error.status >= 500) {
			return false; // Server error, token may still be valid
		}

		return null; // 401/403/invalid token or anything else
	}
}

/**
 * Cache-backed wrapper around {@link fetchAuthModel}.
 *
 * This runs on every matched request, so the uncached path puts a backend round-trip in
 * front of each navigation. Only successful lookups are stored: an invalid token (`null`)
 * and a backend outage (`false`) must stay live decisions, since caching either would turn a
 * transient failure into a sticky one.
 *
 * @param token
 */
async function resolveAuthModel(
	token: string,
): Promise<AuthModel | null | false> {
	const cachedAuthModel = await getCachedAuthModel(token);

	if (cachedAuthModel) {
		return cachedAuthModel;
	}

	const authModel = await fetchAuthModel(token);

	if (authModel) {
		await setCachedAuthModel(token, authModel);
	}

	return authModel;
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

	// Only enforce origin checks on state-changing requests
	const isMutating = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method);

	if (isMutating && !ctx.isValidRequestSource()) {
		return new NextResponse('Forbidden', { status: 403 });
	}

	ctx.setupLanguage();

	const pathname = req.nextUrl.pathname;
	const routeMatch = Routes.match(pathname);

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
