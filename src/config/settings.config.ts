import {
	getObjectValue,
	type ObjectValue,
	setObjectValue,
} from '@/helpers/objects.helper';
import type { Currency, Language } from '@/types/common.type';

type Settings = { [key: string]: ObjectValue };

function loadSettings(): Settings {
	return {
		app: {
			debug: process.env.NEXT_PUBLIC_APP_DEBUG === 'true',
			environment: process.env.NEXT_PUBLIC_NODE_ENV || 'production',
			url: process.env.NEXT_PUBLIC_APP_URL,
			name: process.env.NEXT_PUBLIC_APP_NAME,
			timezone: process.env.NEXT_PUBLIC_TIMEZONE || 'UTC',

			currency: process.env.NEXT_PUBLIC_APP_CURRENCY || 'RON',
			vat_rate: process.env.NEXT_PUBLIC_APP_VAT_RATE || 24,
		},
		language: {
			default: process.env.NEXT_PUBLIC_LANGUAGE_DEFAULT || 'ro',
			supported: (process.env.NEXT_PUBLIC_LANGUAGE_SUPPORTED || 'ro,en')
				.trim()
				.split(','),
			cookie_name:
				process.env.NEXT_PUBLIC_LANGUAGE_COOKIE || 'app-language',
			cookie_max_age:
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
			// loginMaxFailedAttemptsForIp: 5,
			// loginMaxFailedAttemptsForEmail: 3,
			// LoginFailedAttemptsLockTime: 900, // block logins for 15 minutes when too many failed attempts
			sessionToken: process.env.SESSION_TOKEN || 'session',
			sessionMaxAge: 60 * Number(process.env.SESSION_MAX_AGE || 10800),
		},
		remoteApi: {
			url: process.env.REMOTE_API_URL,
			wsUrl: process.env.NEXT_PUBLIC_REMOTE_API_WS_URL,
			wsReconnectDelay:
				Number(process.env.NEXT_PUBLIC_REMOTE_API_WS_RECONNECT_DELAY) ||
				3000,
		},
		middleware: {
			rate_limit_window: Number(process.env.RATE_LIMIT_WINDOW) || 60, // seconds
			max_requests: Number(process.env.MAX_REQUESTS) || 100, // Max requests per window
		},
		redis: {
			host: process.env.REDIS_HOST || 'localhost',
			port: process.env.REDIS_PORT || '6379',
			password: process.env.REDIS_PASSWORD || undefined,
		},
		cache: {
			ttl: process.env.CACHE_TTL || 60,
		},
		mail: {
			provider: process.env.MAIL_PROVIDER || 'smtp', // 'smtp' or 'ses'
			from: {
				name: process.env.MAIL_FROM_NAME || 'NReady',
				address: process.env.MAIL_FROM_ADDRESS || 'engine@play-zone.ro',
			},
			host: process.env.MAIL_HOST,
			port: parseInt(process.env.MAIL_PORT || '2525', 10),
			encryption: process.env.MAIL_ENCRYPTION === 'true',
			username: process.env.MAIL_USERNAME || '',
			password: process.env.MAIL_PASSWORD || '',
		},
		images: {
			storage: process.env.IMAGE_STORAGE || 'local',
			local: {
				save: process.env.IMAGE_SAVE_PATH ?? 'public/uploads',
				view: process.env.IMAGE_VIEW_PATH ?? '/uploads',
			},
			s3: {
				bucket: process.env.AWS_S3_BUCKET ?? '',
				region: process.env.AWS_REGION ?? 'eu-central-1',
				accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? '',
				secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? '',
				baseUrl: process.env.AWS_S3_BASE_URL ?? '',
			},
			maxSizeBytes: 10 * 1024 * 1024,
		},
	};
}

export const Configuration = {
	get: <T = ObjectValue>(key: string): T | undefined => {
		const value = getObjectValue(loadSettings(), key);

		if (value === undefined) {
			console.warn(`Configuration key not found: ${key}`);
		}

		return value as T;
	},

	set: (key: string, value: ObjectValue): void => {
		const success = setObjectValue(loadSettings(), key, value);

		if (!success) {
			console.warn(`Failed to set configuration key: ${key}`);
		}
	},

	isSupportedLanguage: (language: string): boolean => {
		const languages = Configuration.get<string[]>('language.supported');

		return Array.isArray(languages) && languages.includes(language);
	},

	environment: () => {
		return Configuration.get('app.environment') as string;
	},

	isEnvironment: (value: string) => {
		return Configuration.environment() === value;
	},

	defaultLanguage: () => {
		return Configuration.get('language.default') as Language;
	},

	currency: () => {
		return Configuration.get('app.currency') as Currency;
	},
};
