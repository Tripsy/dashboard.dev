import type {
	CreateFunctionType,
	DeleteFunctionType,
	FindFunctionParamsType,
	FindFunctionResponseType,
	FindFunctionType,
	UpdateFunctionType,
} from '@/config/data-source';
import { ApiRequest, getResponseData } from '@/helpers/api.helper';
import { buildQueryString } from '@/helpers/string.helper';
import type { UserFormValuesType, UserModel } from '@/models/user.model';
import type { UserPermissionModel } from '@/models/user-permission.model';
import type { ApiResponseFetch } from '@/types/api.type';

export const findUsers: FindFunctionType<UserModel> = async (
	params: FindFunctionParamsType,
) => {
	const query = buildQueryString(params);

	const response: ApiResponseFetch<FindFunctionResponseType<UserModel>> =
		await new ApiRequest().doFetch(`/users?${query}`);

	return getResponseData<FindFunctionResponseType<UserModel>>(response);
};

export const createUser: CreateFunctionType<
	UserModel,
	UserFormValuesType
> = async (params: UserFormValuesType) => {
	return await new ApiRequest().doFetch('/users', {
		method: 'POST',
		body: JSON.stringify(params),
	});
};

export const updateUser: UpdateFunctionType<
	UserModel,
	UserFormValuesType
> = async (params: UserFormValuesType, id: number) => {
	return await new ApiRequest().doFetch(`/users/${id}`, {
		method: 'PUT',
		body: JSON.stringify(params),
	});
};

export const deleteUser: DeleteFunctionType = async (ids: number[]) => {
	const id = ids[0];

	return await new ApiRequest().doFetch(`/users/${id}`, {
		method: 'DELETE',
	});
};

export const enableUser = async (
	ids: number[],
): Promise<ApiResponseFetch<null>> => {
	const id = ids[0];

	return await new ApiRequest().doFetch(`/users/${id}/status/active`, {
		method: 'PATCH',
	});
};

export const disableUser = async (
	ids: number[],
): Promise<ApiResponseFetch<null>> => {
	const id = ids[0];

	return await new ApiRequest().doFetch(`/users/${id}/status/inactive`, {
		method: 'PATCH',
	});
};

export const restoreUser = async (
	ids: number[],
): Promise<ApiResponseFetch<null>> => {
	const id = ids[0];

	return await new ApiRequest().doFetch(`/users/${id}/restore`, {
		method: 'PATCH',
	});
};

export const getUser = async (id: number) => {
	const response: ApiResponseFetch<UserModel> =
		await new ApiRequest().doFetch(`/users/${id}`);

	return getResponseData(response);
};

type GetUserPermissionsType = {
	entries: UserPermissionModel[];
	pagination: {
		page: number;
		limit: number;
		total: number;
	};
};

export const getUserPermissions = async (
	user_id: number,
	params: FindFunctionParamsType,
) => {
	const query = buildQueryString(params);

	const response: ApiResponseFetch<GetUserPermissionsType> =
		await new ApiRequest().doFetch(
			`/users/${user_id}/permissions?${query}`,
		);

	return getResponseData(response);
};

export const createUserPermissions = async (
	user_id: number,
	permission_ids: number[],
): Promise<ApiResponseFetch<{ permission_id: number; message: string }[]>> => {
	return await new ApiRequest().doFetch(`/users/${user_id}/permissions`, {
		method: 'POST',
		body: JSON.stringify({
			user_id,
			permission_ids,
		}),
	});
};

export const deleteUserPermission = async (
	user_id: number,
	permission_id: number,
): Promise<ApiResponseFetch<null>> => {
	return await new ApiRequest().doFetch(
		`/users/${user_id}/permissions/${permission_id}`,
		{
			method: 'DELETE',
		},
	);
};
