import type {
	DeleteFunctionType,
	FindFunctionParamsType,
	FindFunctionResponseType,
	FindFunctionType,
} from '@/config/data-source';
import { ApiRequest, getResponseData } from '@/helpers/api.helper';
import { buildQueryString } from '@/helpers/string.helper';
import type { CronHistoryModel } from '@/models/cron-history.model';
import type { ApiResponseFetch } from '@/types/api.type';

export const findCronHistory: FindFunctionType<CronHistoryModel> = async (
	params: FindFunctionParamsType,
) => {
	const query = buildQueryString(params);

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
