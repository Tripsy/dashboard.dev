import {
	ApiRequest,
	buildQueryString,
	getResponseData,
} from '@/helpers/api.helper';
import type { LogDataModel } from '@/models/log-data.model';
import type {
	DeleteFunctionType,
	FindFunctionParamsType,
	FindFunctionResponseType,
	FindFunctionType,
} from '@/types/action-function.type';
import type { ApiResponseFetch, QueryFiltersType } from '@/types/api.type';

export const findLogData: FindFunctionType<LogDataModel> = async (
	params: FindFunctionParamsType,
) => {
	const query = buildQueryString(params as QueryFiltersType);

	const response: ApiResponseFetch<FindFunctionResponseType<LogDataModel>> =
		await new ApiRequest().doFetch(`/log-data?${query}`);

	return getResponseData(response);
};

export const deleteLogData: DeleteFunctionType = async (ids: number[]) => {
	return await new ApiRequest().doFetch(`/log-data`, {
		method: 'DELETE',
		body: JSON.stringify({
			ids,
		}),
	});
};
