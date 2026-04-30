import type { DataSourceKey } from '@/config/data-source.config';
import {
	ApiRequest,
	buildQueryString,
	getResponseData,
} from '@/helpers/api.helper';
import type {
	FindFunctionParamsType,
	FindFunctionResponseType,
} from '@/types/action.type';
import type { ApiResponseFetch, QueryFiltersType } from '@/types/api.type';

export async function requestView<Entry>(
	datasource: DataSourceKey,
	id: number,
) {
	const response: ApiResponseFetch<Entry> = await new ApiRequest().doFetch(
		`/${datasource}/${id}`,
	);

	return getResponseData(response);
}

export async function requestFind<Entry>(
	dataSource: DataSourceKey,
	params: FindFunctionParamsType,
) {
	const query = buildQueryString(params as QueryFiltersType);

	const response: ApiResponseFetch<FindFunctionResponseType<Entry>> =
		await new ApiRequest().doFetch(`/${dataSource}?${query}`);

	return getResponseData<FindFunctionResponseType<Entry>>(response);
}

export async function requestCreate<Entry, RequestParams>(
	dataSource: DataSourceKey,
	params: RequestParams,
): Promise<ApiResponseFetch<Partial<Entry>>> {
	return await new ApiRequest().doFetch(`/${dataSource}`, {
		method: 'POST',
		body: JSON.stringify(params),
	});
}

export async function requestUpdate<Entry, RequestParams>(
	dataSource: DataSourceKey,
	params: RequestParams,
	id: number,
): Promise<ApiResponseFetch<Partial<Entry>>> {
	return await new ApiRequest().doFetch(`/${dataSource}/${id}`, {
		method: 'PUT',
		body: JSON.stringify(params),
	});
}

export async function requestDelete<Entry extends { id: number }>(
	dataSource: DataSourceKey,
	entry: Entry,
): Promise<ApiResponseFetch<null>> {
	return await new ApiRequest().doFetch(`/${dataSource}/${entry.id}`, {
		method: 'DELETE',
	});
}

export async function requestDeleteMultiple(
	dataSource: DataSourceKey,
	ids: number[],
): Promise<ApiResponseFetch<null>> {
	return await new ApiRequest().doFetch(`/${dataSource}`, {
		method: 'DELETE',
		body: JSON.stringify({
			ids,
		}),
	});
}

export async function requestRestore<Entry extends { id: number }>(
	dataSource: DataSourceKey,
	entry: Entry,
): Promise<ApiResponseFetch<null>> {
	return await new ApiRequest().doFetch(
		`/${dataSource}/${entry.id}/restore`,
		{
			method: 'PATCH',
		},
	);
}

export async function requestUpdateStatus<Entry extends { id: number }>(
	dataSource: DataSourceKey,
	entry: Entry,
	status: string,
): Promise<ApiResponseFetch<null>> {
	return await new ApiRequest().doFetch(
		`/${dataSource}/${entry.id}/status/${status}`,
		{
			method: 'PATCH',
		},
	);
}
