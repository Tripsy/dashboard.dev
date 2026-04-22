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

export type QueryValueType =
	| string
	| number
	| boolean
	| Date
	| null
	| undefined
	| Array<string | number | boolean>;

export type QueryFiltersType = Record<string, QueryValueType>;
