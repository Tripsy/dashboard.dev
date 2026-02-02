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

export const findLogData: FindFunctionType<'log_data'> = async (
	params: FindFunctionParamsType,
) => {
	const query = buildQueryString(params);

	const response: ResponseFetch<FindFunctionResponseType<'log_data'>> =
		await new ApiRequest().doFetch(`/log-data?${query}`);

	return getResponseData<FindFunctionResponseType<'log_data'>>(response);
};

export const deleteLogData: DeleteFunctionType = async (ids: number[]) => {
	return await new ApiRequest().doFetch(`/log-data`, {
		method: 'DELETE',
		body: JSON.stringify({
			ids,
		}),
	});
};
