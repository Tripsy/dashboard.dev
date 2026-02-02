export type ApiRequestMode =
	| 'same-site'
	| 'use-proxy'
	| 'remote-api'
	| 'custom';

export type ApiResponseFetch<T> =
	| {
			data?: T;
			message: string;
			success: boolean;
	  }
	| undefined;
