import type {
	DeleteFunctionType,
	FindFunctionParamsType,
	FindFunctionResponseType,
	FindFunctionType,
} from '@/config/data-source';
import { ApiRequest, getResponseData } from '@/helpers/api.helper';
import { buildQueryString } from '@/helpers/string.helper';
import type { ApiResponseFetch } from '@/types/api.type';

export const findLogHistory: FindFunctionType<'log_history'> = async (
	params: FindFunctionParamsType,
) => {
	const query = buildQueryString(params);

	const response: ApiResponseFetch<FindFunctionResponseType<'log_history'>> =
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
