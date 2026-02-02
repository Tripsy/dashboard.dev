import type {
	CreateFunctionType,
	DataSourceModel,
	DataSourceType,
	DeleteFunctionType,
	FindFunctionParamsType,
	FindFunctionResponseType,
	FindFunctionType,
	UpdateFunctionType,
} from '@/config/data-source';
import { ApiRequest, getResponseData } from '@/helpers/api.helper';
import { buildQueryString } from '@/helpers/string.helper';
import type { ApiResponseFetch } from '@/types/api.type';

export const findTemplates: FindFunctionType<'templates'> = async (
	params: FindFunctionParamsType,
) => {
	const query = buildQueryString(params);

	const response: ApiResponseFetch<FindFunctionResponseType<'templates'>> =
		await new ApiRequest().doFetch(`/templates?${query}`);

	return getResponseData<FindFunctionResponseType<'templates'>>(response);
};

export const createTemplate: CreateFunctionType<'templates'> = async (
	params: DataSourceType['templates']['formValues'],
) => {
	return await new ApiRequest().doFetch('/templates', {
		method: 'POST',
		body: JSON.stringify(params),
	});
};

export const updateTemplate: UpdateFunctionType<'templates'> = async (
	params: DataSourceType['templates']['formValues'],
	id: number,
) => {
	return await new ApiRequest().doFetch(`/templates/${id}`, {
		method: 'PUT',
		body: JSON.stringify(params),
	});
};

export const deleteTemplate: DeleteFunctionType = async (ids: number[]) => {
	const id = ids[0];

	return await new ApiRequest().doFetch(`/templates/${id}`, {
		method: 'DELETE',
	});
};

export const restoreTemplate = async (
	ids: number[],
): Promise<ApiResponseFetch<null>> => {
	const id = ids[0];

	return await new ApiRequest().doFetch(`/templates/${id}/restore`, {
		method: 'PATCH',
	});
};

export const getTemplate = async (id: number) => {
	const response: ApiResponseFetch<DataSourceModel<'templates'>> =
		await new ApiRequest().doFetch(`/templates/${id}`);

	return getResponseData(response);
};
