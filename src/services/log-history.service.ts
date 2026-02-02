import type {
	DeleteFunctionType,
	FindFunctionParamsType,
	FindFunctionResponseType,
	FindFunctionType,
} from '@/config/data-source';
import {
	ApiRequest,
	getResponseData,
	type ResponseFetch,
} from '@/helpers/api.helper';
import { buildQueryString } from '@/helpers/string.helper';

export const findLogHistory: FindFunctionType<'log_history'> = async (
	params: FindFunctionParamsType,
) => {
	const query = buildQueryString(params);

	const response: ResponseFetch<FindFunctionResponseType<'log_history'>> =
		await new ApiRequest().doFetch(`/log-history?${query}`);

	return getResponseData<FindFunctionResponseType<'log_history'>>(response);
};

export const deleteLogHistory: DeleteFunctionType = async (ids: number[]) => {
	return await new ApiRequest().doFetch(`/log-history`, {
		method: 'DELETE',
		body: JSON.stringify({
			ids,
		}),
	});
};
