import type {
	CreateFunctionType,
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

export const findPermissions: FindFunctionType<'permissions'> = async (
	params: FindFunctionParamsType,
) => {
	const query = buildQueryString(params);

	const response: ApiResponseFetch<FindFunctionResponseType<'permissions'>> =
		await new ApiRequest().doFetch(`/permissions?${query}`);

	return getResponseData<FindFunctionResponseType<'permissions'>>(response);
};

export const createPermissions: CreateFunctionType<'permissions'> = async (
	params: DataSourceType['permissions']['formValues'],
) => {
	return await new ApiRequest().doFetch('/permissions', {
		method: 'POST',
		body: JSON.stringify(params),
	});
};

export const updatePermissions: UpdateFunctionType<'permissions'> = async (
	params: DataSourceType['permissions']['formValues'],
	id: number,
) => {
	return await new ApiRequest().doFetch(`/permissions/${id}`, {
		method: 'PUT',
		body: JSON.stringify(params),
	});
};

export const deletePermissions: DeleteFunctionType = async (ids: number[]) => {
	const id = ids[0];

	return await new ApiRequest().doFetch(`/permissions/${id}`, {
		method: 'DELETE',
	});
};

export const restorePermissions = async (
	ids: number[],
): Promise<ApiResponseFetch<null>> => {
	const id = ids[0];

	return await new ApiRequest().doFetch(`/permissions/${id}/restore`, {
		method: 'PATCH',
	});
};
