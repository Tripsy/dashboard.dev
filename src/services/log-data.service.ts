import type {
	DeleteFunctionType,
	FindFunctionParamsType,
	FindFunctionResponseType,
	FindFunctionType,
} from '@/config/data-source';
import { ApiRequest, getResponseData } from '@/helpers/api.helper';
import { buildQueryString } from '@/helpers/string.helper';
import type { LogDataModel } from '@/models/log-data.model';
import type { ApiResponseFetch } from '@/types/api.type';

export const findLogData: FindFunctionType<LogDataModel> = async (
	params: FindFunctionParamsType,
) => {
	const query = buildQueryString(params);

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
