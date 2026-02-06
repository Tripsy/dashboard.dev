import type {
	CreateFunctionType,
	DeleteFunctionType,
	FindFunctionParamsType,
	FindFunctionResponseType,
	FindFunctionType,
	UpdateFunctionType,
} from '@/config/data-source.config';
import { ApiRequest, getResponseData } from '@/helpers/api.helper';
import { buildQueryString } from '@/helpers/string.helper';
import type {
	PermissionFormValuesType,
	PermissionModel,
} from '@/models/permission.model';
import type { ApiResponseFetch } from '@/types/api.type';

export const findPermissions: FindFunctionType<PermissionModel> = async (
	params: FindFunctionParamsType,
) => {
	const query = buildQueryString(params);

	const response: ApiResponseFetch<
		FindFunctionResponseType<PermissionModel>
	> = await new ApiRequest().doFetch(`/permissions?${query}`);

	return getResponseData(response);
};

export const createPermissions: CreateFunctionType<
	PermissionModel,
	PermissionFormValuesType
> = async (params: PermissionFormValuesType) => {
	return await new ApiRequest().doFetch('/permissions', {
		method: 'POST',
		body: JSON.stringify(params),
	});
};

export const updatePermissions: UpdateFunctionType<
	PermissionModel,
	PermissionFormValuesType
> = async (params: PermissionFormValuesType, id: number) => {
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
