import {
	ApiRequest,
	buildQueryString,
	getResponseData,
} from '@/helpers/api.helper';
import type { LogHistoryModel } from '@/models/log-history.model';
import type {
	DeleteFunctionType,
	FindFunctionParamsType,
	FindFunctionResponseType,
	FindFunctionType,
} from '@/types/action.type';
import type { ApiResponseFetch, QueryFiltersType } from '@/types/api.type';

export const findLogHistory: FindFunctionType<LogHistoryModel> = async (
	params: FindFunctionParamsType,
) => {
	const query = buildQueryString(params as QueryFiltersType);

	const response: ApiResponseFetch<
		FindFunctionResponseType<LogHistoryModel>
	> = await new ApiRequest().doFetch(`/log-history?${query}`);

	return getResponseData(response);
};

export const deleteLogHistory: DeleteFunctionType = async (ids: number[]) => {
	return await new ApiRequest().doFetch(`/log-history`, {
		method: 'DELETE',
		body: JSON.stringify({
			ids,
		}),
	});
};
