import {
	ApiRequest,
	buildQueryString,
	getResponseData,
} from '@/helpers/api.helper';
import type { CronHistoryModel } from '@/models/cron-history.model';
import type {
	DeleteFunctionType,
	FindFunctionParamsType,
	FindFunctionResponseType,
	FindFunctionType,
} from '@/types/action.type';
import type { ApiResponseFetch, QueryFiltersType } from '@/types/api.type';

export const findCronHistory: FindFunctionType<CronHistoryModel> = async (
	params: FindFunctionParamsType,
) => {
	const query = buildQueryString(params as QueryFiltersType);

	const response: ApiResponseFetch<
		FindFunctionResponseType<CronHistoryModel>
	> = await new ApiRequest().doFetch(`/cron-history?${query}`);

	return getResponseData(response);
};

export const deleteCronHistory: DeleteFunctionType = async (ids: number[]) => {
	return await new ApiRequest().doFetch(`/cron-history`, {
		method: 'DELETE',
		body: JSON.stringify({
			ids,
		}),
	});
};
