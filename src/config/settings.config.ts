import { getObjectValue, type ObjectValue } from '@/helpers/objects.helper';
import type { Currency, Language } from '@/types/common.type';

function loadSettings() {
	return {
		app: {
			debug: process.env.NEXT_PUBLIC_APP_DEBUG === 'true',
			environment: process.env.NEXT_PUBLIC_NODE_ENV || 'production',
			url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost',
			name: process.env.NEXT_PUBLIC_APP_NAME || 'NReady',
			email: process.env.NEXT_PUBLIC_APP_EMAIL || 'hello@example.com',
			timezone: process.env.NEXT_PUBLIC_TIMEZONE || 'UTC',
			currency: (process.env.NEXT_PUBLIC_APP_CURRENCY ||
				'RON') as Currency,
			vatRate: Number(process.env.NEXT_PUBLIC_APP_VAT_RATE || 24),
		},
		language: {
			default: (process.env.NEXT_PUBLIC_LANGUAGE_DEFAULT ||
				'ro') as Language,
			supported: (process.env.NEXT_PUBLIC_LANGUAGE_SUPPORTED || 'ro,en')
				.trim()
				.split(','),
			cookieName:
				process.env.NEXT_PUBLIC_LANGUAGE_COOKIE || 'app-language',
			// Env value is in days, the cookie wants seconds.
			cookieMaxAge:
				Number(process.env.NEXT_PUBLIC_LANGUAGE_COOKIE_MAX_AGE || 365) *
				60 *
				60 *
				24,
		},
		security: {
			allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',').map((v) =>
				v.trim(),
			) || ['http://localhost'],
		},
		csrf: {
			cookieName: 'x-csrf-secret',
			cookieMaxAge: 60 * 60, // 1 hour
			inputName: 'x-csrf-token',
		},
		user: {
			nameMinChars: 3,
			passwordMinChars: 8,
			sessionToken: process.env.SESSION_TOKEN || 'session',
			// Seconds, and it has to track the backend's AUTH_JWT_EXPIRES_IN (86400).
			// The backend signs its JWT without an `exp` claim — a token's lifetime lives in
			// `account_token.expire_at` (`now + authExpiresIn`), which auth.middleware slides
			// forward on use. A cookie outliving that leaves the browser holding a session it
			// believes is valid while every request behind it fails auth. The previous
			// `60 *` treated the env value as minutes, giving a ~60 day cookie against a
			// 24 hour token.
			sessionMaxAge: Number(process.env.SESSION_MAX_AGE || 86400),
			// Seconds of remaining life below which the session cookie is rewritten with a
			// full `sessionMaxAge` again. Mirrors the backend's AUTH_JWT_REFRESH_EXPIRES_IN
			// (28800), which is the same threshold auth.middleware uses to slide `expire_at`
			// forward — so the cookie and the token it stands for extend together. Lower
			// values are safe but log the user out while their backend session is still
			// alive; higher ones rewrite the cookie on almost every request.
			sessionRefreshThreshold: Number(
				process.env.SESSION_REFRESH_THRESHOLD || 28800,
			),
		},
		remoteApi: {
			url: process.env.REMOTE_API_URL,
			wsUrl: process.env.NEXT_PUBLIC_REMOTE_API_WS_URL,
			wsReconnectDelay:
				Number(process.env.NEXT_PUBLIC_REMOTE_API_WS_RECONNECT_DELAY) ||
				3000,
		},
		middleware: {
			rateLimitWindow: Number(process.env.RATE_LIMIT_WINDOW) || 60, // seconds
			maxRequests: Number(process.env.MAX_REQUESTS) || 100, // Max requests per window
		},
		redis: {
			host: process.env.REDIS_HOST || 'localhost',
			port: parseInt(process.env.REDIS_PORT || '6379', 10),
			/*
			 * This app and star-backend share one Redis instance and database, so every key
			 * is namespaced by app. Applied in `CacheProvider.buildKey` rather than through
			 * ioredis's own `keyPrefix` option: that one does not reach the MATCH argument of
			 * SCAN, so `deleteByPattern` would scan the *other* app's keys and then delete
			 * against them — leaving the collision risk in place while appearing to solve it.
			 */
			keyPrefix: process.env.REDIS_KEY_PREFIX || 'dashboard',
			password: process.env.REDIS_PASSWORD || '',
		},
		cache: {
			ttl: Number(process.env.CACHE_TTL ?? 60),
			// Lifetime of a cached `/account/me` result, in seconds. Kept short because it
			// bounds how long a backend permission/role change stays invisible to the proxy.
			// Set to 0 to disable the cache entirely (no Redis connection is opened).
			authTtl: Number(process.env.CACHE_AUTH_TTL ?? 30),
		},
		// Only S3 image storage reads these; the app does not send mail (the backend does).
		aws: {
			region: process.env.AWS_REGION || 'eu-central-1',
			accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
			secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
		},
		images: {
			storage: process.env.IMAGE_STORAGE || 'local',
			local: {
				save: process.env.IMAGE_SAVE_PATH ?? 'public/uploads',
				view: process.env.IMAGE_VIEW_PATH ?? '/uploads',
			},
			s3: {
				bucket: process.env.AWS_S3_BUCKET ?? '',
			},
			maxSizeBytes: 10 * 1024 * 1024,
		},
	};
}

type Settings = ReturnType<typeof loadSettings>;

/**
 * Every valid dotted path into `Settings`, as a union of string literals.
 *
 * Arrays stop the recursion — `language.supported` is a leaf, there is no
 * `language.supported.0`. `NonNullable` lets an optional branch (`mail.host` is
 * `string | undefined`) still be classified by its non-undefined type.
 */
export type SettingsKey<T = Settings> = {
	[K in keyof T & string]: T[K] extends readonly unknown[]
		? K
		: NonNullable<T[K]> extends object
			? K | `${K}.${SettingsKey<NonNullable<T[K]>>}`
			: K;
}[keyof T & string];

/** The type stored at a given dotted path. */
export type SettingsValue<
	K extends string,
	T = Settings,
> = K extends `${infer Head}.${infer Rest}`
	? Head extends keyof T
		? SettingsValue<Rest, NonNullable<T[Head]>>
		: never
	: K extends keyof T
		? T[K]
		: never;

/**
 * Settings are derived once, on first read, and reused.
 *
 * The cache is per bundle (server, client, middleware each hold their own), which is
 * fine: each one is populated from values fixed at build or boot time.
 */
let settings: Settings | undefined;

function getSettings(): Settings {
	settings ??= loadSettings();

	return settings;
}

export const Configuration = {
	/**
	 * Reads a setting by dotted path. The path is checked against the shape of
	 * `loadSettings()`, so a typo is a compile error rather than an `undefined` at runtime,
	 * and the return type is inferred.
	 */
	get: <K extends SettingsKey>(key: K): SettingsValue<K> => {
		const value = getObjectValue(
			getSettings() as Record<string, ObjectValue>,
			key,
		);

		if (value === undefined) {
			// Unreachable for a well-typed key unless the value is genuinely optional
			// (eg: `mail.host`); kept as a guard for dynamic paths.
			console.warn(`Configuration key not found: ${key}`);
		}

		return value as SettingsValue<K>;
	},

	// These read the cached object directly rather than going through `get()`, skipping the
	// path split and lookup. They are the hot paths — `isEnvironment` runs on every request
	// in the proxy, `defaultLanguage` on every translated render.
	environment: () => {
		return getSettings().app.environment;
	},

	isEnvironment: (value: string) => {
		return getSettings().app.environment === value;
	},

	defaultLanguage: (): Language => {
		return getSettings().language.default;
	},

	isSupportedLanguage: (language: string): boolean => {
		return getSettings().language.supported.includes(language);
	},

	currency: (): Currency => {
		return getSettings().app.currency;
	},
};
