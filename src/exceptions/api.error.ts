import type { ResponseFetch } from '@/helpers/api.helper';

export class ApiError<T = unknown> extends Error {
	constructor(
		message: string,
		public status: number,
		public body?: ResponseFetch<T>,
	) {
		super(body?.message || message);
		this.name = 'ApiError';
		this.status = status;
		this.body = body;

		// Maintain proper stack trace
		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, ApiError);
		}
	}
}
