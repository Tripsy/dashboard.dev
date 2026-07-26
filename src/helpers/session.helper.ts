'use server';

import { cookies } from 'next/headers';
import { Configuration } from '@/config/settings.config';
import { getFormDataAsString } from '@/helpers/form.helper';

export type CookieOptions = {
	httpOnly?: boolean;
	secure?: boolean;
	path?: string;
	sameSite?: 'lax' | 'strict' | 'none';
	maxAge: number;
	expires?: Date;
	domain?: string;
};

export async function setCookie(
	name: string,
	value: string,
	options?: CookieOptions,
): Promise<void> {
	const cookieStore = await cookies();

	cookieStore.set(name, value, {
		httpOnly: options?.httpOnly ?? false,
		secure: options?.secure ?? Configuration.isEnvironment('production'),
		path: options?.path ?? '/',
		sameSite: options?.sameSite ?? 'lax',
		maxAge: options?.maxAge,
		expires: options?.expires,
		domain: options?.domain,
	});
}

export async function getCookie(name: string): Promise<string | undefined> {
	const cookieStore = await cookies();

	return cookieStore.get(name)?.value;
}

export async function deleteCookie(name: string, path?: string): Promise<void> {
	const cookieStore = await cookies();

	cookieStore.delete({
		name,
		path: path ?? '/',
	});
}

export type TrackedCookie = {
	name: string;
	value?: string;
	action: 'set' | 'none';
};

/**
 * Reads a cookie and reports whether it is close enough to expiry to be rewritten.
 *
 * @param name - cookie name; its expiry is tracked in a sibling `<name>-expiration` cookie
 * @param expireIn - seconds of remaining life below which `action` comes back as 'set'.
 *   The 20 minute default suits short-lived cookies (CSRF); the session cookie passes
 *   `user.sessionRefreshThreshold` so it slides in step with the backend token.
 */
export async function getTrackedCookie(
	name: string,
	expireIn: number = 1200,
): Promise<TrackedCookie> {
	const output: TrackedCookie = {
		name: name,
		value: undefined,
		action: 'set',
	};

	const cookieValue = await getCookie(name);

	if (!cookieValue) {
		return output;
	}

	output.value = cookieValue;

	const cookieExpirationValue = await getCookie(`${name}-expiration`);
	const expirationTime = cookieExpirationValue
		? Number(cookieExpirationValue)
		: 0;

	if (expirationTime - Date.now() > expireIn * 1000) {
		output.action = 'none';
	}

	return output;
}

export async function setupTrackedCookie(
	cookie: TrackedCookie,
	options: CookieOptions,
): Promise<void> {
	if (cookie.action === 'none') {
		return;
	}

	if (!cookie.value) {
		return;
	}

	await setCookie(cookie.name, cookie.value, options);

	const expirationTime = Date.now() + options.maxAge * 1000;

	await setCookie(
		`${cookie.name}-expiration`,
		expirationTime.toString(),
		options,
	);
}

export async function isValidCsrfToken(formData: FormData) {
	const inputValue = getFormDataAsString(
		formData,
		Configuration.get('csrf.inputName'),
	);

	const cookieValue = await getCookie(Configuration.get('csrf.cookieName'));

	return cookieValue === inputValue;
}
