import {DataTableFiltersType} from "@/config/data-source.config";

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

export type QueryValue =
	| string
	| number
	| boolean
	| null
	| undefined
	| Array<string | number | boolean>
	| DataTableFiltersType;