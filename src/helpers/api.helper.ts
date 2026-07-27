import Routes from '@/config/routes.setup';
import { Configuration } from '@/config/settings.config';
import { ApiError } from '@/exceptions/api.error';
import type {
	ApiRequestMode,
	ApiResponseFetch,
	QueryFiltersType,
} from '@/types/api.type';
import type { DataSourceKey } from '@/types/data-source.key';

/**
 * Build a query string from an object
 *
 * @param {Record<string, string | number | boolean | undefined | null>} params - The object to build the query string from
 * @returns {string} - The query string
 */
export const buildQueryString = (params: QueryFiltersType): string => {
	const query = new URLSearchParams();

	Object.entries(params).forEach(([key, value]) => {
		if (value === undefined || value === null || value === '') {
			return;
		}

		if (Array.isArray(value)) {
			value.forEach((v) => {
				query.append(key, String(v));
			});
			return;
		}

		if (typeof value === 'object') {
			if (key === 'filter') {
				Object.entries(value).forEach(([filterKey, filterValue]) => {
					// Prune exactly as the top-level branch above does. Without this an
					// unset filter is sent as the literal string "undefined", which the
					// backend then matches against.
					if (
						filterValue === undefined ||
						filterValue === null ||
						filterValue === ''
					) {
						return;
					}

					query.append(`filter[${filterKey}]`, String(filterValue));
				});
			} else {
				console.warn(`Skipping object param "${key}" in query`);
			}

			return;
		}

		query.append(key, String(value));
	});

	return query.toString();
};

export function getRemoteApiUrl(path: string): string {
	path = path.replace(/^\//, ''); // Remove the first ` / ` if exist

	return `${Configuration.get('remoteApi.url')}/${path}`;
}

export function getResponseData<T>(
	response: ApiResponseFetch<T>,
): T | undefined {
	return response?.data;
}

export class ApiRequest {
	static readonly ABORT_TIMEOUT: number = 10000; // 10s

	private requestInit: RequestInit = {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
		},
	};

	private requestMode: ApiRequestMode = 'use-proxy';

	public setRequestMode(mode: ApiRequestMode): this {
		this.requestMode = mode;

		return this;
	}

	/**
	 * Merges `override` onto `base` without touching either, headers included.
	 *
	 * `doFetch` needs this to be pure: folding a call's options into the instance would
	 * leave the method, body and headers of one request set on the next one made through
	 * the same instance.
	 */
	private static mergeRequestInit(
		base: RequestInit,
		override: RequestInit,
	): RequestInit {
		const mergedHeaders = new Headers(base.headers || {});

		if (override.headers) {
			new Headers(override.headers).forEach((value, key) => {
				mergedHeaders.set(key, value);
			});
		}

		return {
			...base,
			...override,
			headers: mergedHeaders,
		};
	}

	public setRequestInit(options: RequestInit): this {
		this.requestInit = ApiRequest.mergeRequestInit(
			this.requestInit,
			options,
		);

		return this;
	}

	private async handleJsonResponse(res: Response) {
		const text = await res.text();

		if (!text) {
			return null;
		}

		try {
			return JSON.parse(text);
		} catch {
			if (res.ok) {
				throw new Error('Invalid JSON response');
			}

			return null; // Explicitly return null for non-JSON error responses
		}
	}

	/**
	 * Always throws — declared `never` so callers are known to be unreachable afterwards.
	 */
	private handleError(error: unknown): never {
		if (error instanceof ApiError) {
			throw error;
		}

		// `AbortSignal.timeout` rejects with a TimeoutError; a manual `controller.abort()`
		// rejects with an AbortError. Both mean the request ran out of time.
		if (
			error instanceof Error &&
			(error.name === 'TimeoutError' || error.name === 'AbortError')
		) {
			throw new ApiError('Request timeout', 408);
		}

		throw new ApiError(
			error instanceof Error ? error.message : 'Network request failed',
			0,
		);
	}

	private buildProxyRoute(path: string) {
		const [rawPath, rawQuery] = path.split('?');

		const routeSegments = rawPath.split('/').filter(Boolean); // eg: filter(Boolean) removes empty segments

		let proxyRoute = Routes.get('proxy', { path: routeSegments });

		if (rawQuery) {
			proxyRoute += `?${rawQuery}`;
		}

		return Configuration.get('app.url') + proxyRoute;
	}

	private buildRequestUrl(path: string) {
		switch (this.requestMode) {
			case 'use-proxy':
				return this.buildProxyRoute(path);
			case 'same-site':
				return Configuration.get('app.url') + Routes.get(path);
			case 'remote-api':
				return getRemoteApiUrl(path);
			default:
				return path;
		}
	}

	public async doFetch<T>(
		path: string,
		requestInit: RequestInit = {},
	): Promise<ApiResponseFetch<T>> {
		try {
			// Inside the try on purpose: `buildRequestUrl` reaches `Routes.get`, which
			// throws for an unknown route name, and that has to surface as an ApiError like
			// every other failure rather than escaping raw.
			const requestUrl = this.buildRequestUrl(path);

			const requestOptions = ApiRequest.mergeRequestInit(
				this.requestInit,
				requestInit,
			);

			// The platform has to set Content-Type for FormData because only it knows the
			// multipart boundary; the default JSON header would make the body unreadable.
			if (requestOptions.body instanceof FormData) {
				(requestOptions.headers as Headers).delete('Content-Type');
			}

			const res = await fetch(requestUrl, {
				...requestOptions,
				/*
				 * One signal covering the whole exchange. The previous timer was cleared
				 * the moment `fetch` resolved — which is when the *headers* arrive — so
				 * reading the body below was left unbounded and a server that stalled
				 * mid-response hung the request indefinitely. A signal also cannot be
				 * leaked the way a timer could when something threw before `clearTimeout`.
				 */
				signal: AbortSignal.timeout(ApiRequest.ABORT_TIMEOUT),
			});

			// Handle non-JSON responses (like 204 No Content)
			if (res.status === 204) {
				return undefined;
			}

			const jsonResponse: ApiResponseFetch<T> =
				await this.handleJsonResponse(res);

			if (!res.ok) {
				throw new ApiError(
					`HTTP ${res.status} Error`,
					res.status,
					jsonResponse,
				);
			}

			return jsonResponse;
		} catch (error) {
			this.handleError(error);
		}
	}
}

/** Data sources whose backend endpoint is the plural of the key. */
const PLURAL_ENDPOINT_KEYS: ReadonlySet<DataSourceKey> = new Set([
	'brand',
	'client',
	'image',
	'permission',
	'place',
	'template',
	'user',
	'vehicle',
	'vendor',
	'company-vehicle',
	'cmr-session',
	'cmr-vehicle',
	'work-session',
	'work-session-vehicle',
]);

export function resolveRequestPath(key: DataSourceKey) {
	if (PLURAL_ENDPOINT_KEYS.has(key)) {
		return `${key}s`;
	}

	return key;
}
