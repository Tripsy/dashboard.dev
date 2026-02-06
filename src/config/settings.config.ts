import {
	getObjectValue,
	type ObjectValue,
	setObjectValue,
} from '@/helpers/objects.helper';

type Settings = { [key: string]: ObjectValue };

let settings: Settings;

function getSettings(): Settings {
	if (!settings) {
		settings = loadSettings();
	}

	return settings;
}

function loadSettings(): Settings {
	return {
		app: {
			debug: process.env.NEXT_PUBLIC_APP_DEBUG === 'true',
			language: process.env.NEXT_PUBLIC_APP_LANGUAGE || 'en',
			languageSupported: (
				process.env.NEXT_PUBLIC_APP_SUPPORTED_LANGUAGES || 'en'
			)
				.trim()
				.split(','),
			environment: process.env.NEXT_PUBLIC_NODE_ENV || 'production',
			url: process.env.NEXT_PUBLIC_APP_URL,
			name: process.env.NEXT_PUBLIC_APP_NAME,
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
			nameMinLength: 3,
			passwordMinLength: 8,
			// loginMaxFailedAttemptsForIp: 5,
			// loginMaxFailedAttemptsForEmail: 3,
			// LoginFailedAttemptsLockTime: 900, // block logins for 15 minutes when too many failed attempts
			sessionToken: process.env.SESSION_TOKEN || 'session',
			sessionMaxAge: 60 * Number(process.env.SESSION_MAX_AGE || 10800),
		},
		remoteApi: {
			url: process.env.REMOTE_API_URL,
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
	};
}

export const Configuration = {
	get: <T = ObjectValue>(key: string): T | undefined => {
		const value = getObjectValue(getSettings(), key);

		if (value === undefined) {
			console.warn(`Configuration key not found: ${key}`);
		}

		return value as T;
	},

	set: (key: string, value: ObjectValue): void => {
		const success = setObjectValue(getSettings(), key, value);

		if (!success) {
			console.warn(`Failed to set configuration key: ${key}`);
		}
	},

	isSupportedLanguage: (language: string): boolean => {
		const languages = Configuration.get<string[]>('app.languageSupported');

		return Array.isArray(languages) && languages.includes(language);
	},

	environment: () => {
		return Configuration.get('app.env') as string;
	},

	isEnvironment: (value: string) => {
		return Configuration.environment() === value;
	},

	resolveExtension: () => {
		return Configuration.environment() === 'production' ? 'js' : 'ts';
	},
};
