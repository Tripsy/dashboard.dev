import { Configuration } from '@/config/settings.config';
import { getObjectValue } from '@/helpers/objects.helper';
import { replaceVars } from '@/helpers/string.helper';
import type { Language } from '@/types/common.type';

type TranslationValue = string | { [key: string]: TranslationValue };
type TranslationResource = Record<string, TranslationValue>;

const languageResources: Record<string, TranslationResource> = {};

async function fetchLanguage(): Promise<Language> {
	const fallback = Configuration.defaultLanguage();

	try {
		const { headers } = await import('next/headers');
		const headerStore = await headers();

		const fromHeader = headerStore.get('x-language')?.trim().toLowerCase();

		if (fromHeader && Configuration.isSupportedLanguage(fromHeader)) {
			return fromHeader as Language;
		}
	} catch (error) {
		console.error('Failed to read language header:', error);
	}

	return fallback;
}

export function getLanguageClient(): Language {
	// Client: read from html[lang] set by RootLayout — always fresh
	const fromDom = document.documentElement.lang?.toLowerCase();

	if (fromDom && Configuration.isSupportedLanguage(fromDom)) {
		return fromDom as Language;
	}

	return Configuration.defaultLanguage();
}

export async function getLanguage(): Promise<Language> {
	if (typeof document !== 'undefined') {
		return getLanguageClient();
	}

	return fetchLanguage();
}

async function loadLanguageResource(
	language: string,
): Promise<TranslationResource> {
	if (languageResources[language]) {
		return languageResources[language];
	}

	languageResources[language] = (
		await import(`@/locales/${language}`)
	).default;

	return languageResources[language];
}

/**
 * Utility function used to get the translated string from the resource.
 * Always returns `string` (Note: if the returned object value is not string, it returns the key)
 */
export const getTranslatedString = (
	resource: TranslationResource,
	key: string,
) => {
	const objectValue = getObjectValue(resource, key);

	return typeof objectValue === 'string' ? objectValue : key;
};

/**
 * Synchronous lookup for a key whose locale resource is already in the module cache.
 *
 * `translate` is async purely because the locale bundle is a dynamic import — once that
 * import has resolved the lookup itself is pure. Client components use this to paint the
 * right text on their first frame instead of flashing empty for a tick.
 *
 * Returns `null` when the resource has not been loaded yet (or on the server), so callers
 * fall back to the async path.
 */
export const translateLoaded = (
	key: string,
	replacements: Record<string, string> = {},
): string | null => {
	if (typeof document === 'undefined') {
		return null;
	}

	const languageResource = languageResources[getLanguageClient()];

	if (!languageResource) {
		return null;
	}

	const value = getTranslatedString(languageResource, key);

	if (value !== key && replacements) {
		return replaceVars(value, replacements);
	}

	return value;
};

/**
 * Translate a key with optional replacements.
 * The key should be in the format `namespace.key`.
 */
export const translate = async (
	key: string,
	replacements: Record<string, string> = {},
): Promise<string> => {
	const languageSelected = await getLanguage();
	const languageResource = await loadLanguageResource(languageSelected);

	const value = getTranslatedString(languageResource, key);

	if (value !== key && replacements) {
		return replaceVars(value, replacements);
	}

	return value;
};

export type TranslateKey<T> = T extends string
	? T
	: T extends { key: infer K }
		? K extends string
			? K
			: never
		: never;

/**
 * Translate multiple keys with optional replacements.
 *
 * @example translateBatch([
 *     { key: "user.create" },
 *     { key: "user.edit", vars: { "user.id": 1 } },
 *     { key: "user.delete" }
 * ])
 */
export const translateBatch = async <
	const T extends readonly (
		| string
		| { key: string; vars?: Record<string, string> }
	)[],
>(
	requests: T,
	keyPrefix?: string,
): Promise<Record<TranslateKey<T[number]>, string>> => {
	const language = await getLanguage();
	const resource = await loadLanguageResource(language);

	const result: Record<string, string> = {};

	for (const request of requests) {
		if (typeof request === 'string') {
			const requestKey = keyPrefix ? `${keyPrefix}.${request}` : request;

			result[request] = getTranslatedString(resource, requestKey);
		} else {
			const requestKey = keyPrefix
				? `${keyPrefix}.${request.key}`
				: request.key;
			const value = getTranslatedString(resource, requestKey);

			if (request.vars) {
				result[request.key] = replaceVars(value, request.vars);
			} else {
				result[request.key] = value;
			}
		}
	}

	return result;
};

// export async function getLocaleValue<T>(key: string): Promise<T | undefined> {
// 	const language = await getLanguage();
// 	const resource = await loadLanguageResource(language);
//
// 	const value = getObjectValue(resource, key);
//
// 	return value as T | undefined;
// }
