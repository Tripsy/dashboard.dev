import type {
	DeleteFunctionType,
	FindFunctionParamsType,
	FindFunctionResponseType,
	FindFunctionType,
} from '@/config/data-source.config';
import { ApiRequest, getResponseData } from '@/helpers/api.helper';
import { buildQueryString } from '@/helpers/string.helper';
import type { LogHistoryModel } from '@/models/log-history.model';
import type { ApiResponseFetch } from '@/types/api.type';

export const findLogHistory: FindFunctionType<LogHistoryModel> = async (
	params: FindFunctionParamsType,
) => {
	const query = buildQueryString(params);

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
