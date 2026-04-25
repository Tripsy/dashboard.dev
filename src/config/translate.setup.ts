import { Configuration } from '@/config/settings.config';
import { ApiRequest } from '@/helpers/api.helper';
import { getObjectValue } from '@/helpers/objects.helper';
import { replaceVars } from '@/helpers/string.helper';

type TranslationValue = string | { [key: string]: TranslationValue };
type TranslationResource = Record<string, TranslationValue>;

let languageSelected: string | null = null;
const languageResources: Record<string, TranslationResource> = {};

async function fetchLanguage() {
	try {
		const result = await new ApiRequest()
			.setRequestMode('same-site')
			.setRequestInit({
				credentials: 'same-origin',
			})
			.doFetch<{ language: string }>('language', {
				method: 'GET',
			});

		return (
			result?.data?.language ||
			(Configuration.get('app.language') as string)
		);
	} catch (error) {
		console.error('Failed to fetch language:', error);

		return Configuration.get('app.language') as string;
	}
}

export async function getLanguage(): Promise<string> {
	if (languageSelected) {
		return languageSelected;
	}

	if (typeof document === 'undefined') {
		languageSelected = await fetchLanguage();
	} else {
		languageSelected =
			document.documentElement.lang || navigator.language?.split('-')[0];
		languageSelected = languageSelected.toLowerCase();
	}

	if (
		languageSelected &&
		Configuration.isSupportedLanguage(languageSelected)
	) {
		return languageSelected;
	}

	return Configuration.get('app.language') as string;
}

export function setLanguage(lang: string) {
	if (Configuration.isSupportedLanguage(lang)) {
		languageSelected = lang;
	}
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
