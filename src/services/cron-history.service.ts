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

export const findCronHistory: FindFunctionType<'cron_history'> = async (
	params: FindFunctionParamsType,
) => {
	const query = buildQueryString(params);

	const response: ResponseFetch<FindFunctionResponseType<'cron_history'>> =
		await new ApiRequest().doFetch(`/cron-history?${query}`);

	return getResponseData<FindFunctionResponseType<'cron_history'>>(response);
};

export const deleteCronHistory: DeleteFunctionType = async (ids: number[]) => {
	return await new ApiRequest().doFetch(`/cron-history`, {
		method: 'DELETE',
		body: JSON.stringify({
			ids,
		}),
	});
};
