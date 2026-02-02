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
import type { UserPermissionModel } from '@/entities/user-permission.model';
import {
	ApiRequest,
	getResponseData,
	type ResponseFetch,
} from '@/helpers/api.helper';
import { buildQueryString } from '@/helpers/string.helper';

export const findUsers: FindFunctionType<'users'> = async (
	params: FindFunctionParamsType,
) => {
	const query = buildQueryString(params);

	const response: ResponseFetch<FindFunctionResponseType<'users'>> =
		await new ApiRequest().doFetch(`/users?${query}`);

	return getResponseData<FindFunctionResponseType<'users'>>(response);
};

export const createUser: CreateFunctionType<'users'> = async (
	params: DataSourceType['users']['formValues'],
) => {
	return await new ApiRequest().doFetch('/users', {
		method: 'POST',
		body: JSON.stringify(params),
	});
};

export const updateUser: UpdateFunctionType<'users'> = async (
	params: DataSourceType['users']['formValues'],
	id: number,
) => {
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
): Promise<ResponseFetch<null>> => {
	const id = ids[0];

	return await new ApiRequest().doFetch(`/users/${id}/status/active`, {
		method: 'PATCH',
	});
};

export const disableUser = async (
	ids: number[],
): Promise<ResponseFetch<null>> => {
	const id = ids[0];

	return await new ApiRequest().doFetch(`/users/${id}/status/inactive`, {
		method: 'PATCH',
	});
};

export const restoreUser = async (
	ids: number[],
): Promise<ResponseFetch<null>> => {
	const id = ids[0];

	return await new ApiRequest().doFetch(`/users/${id}/restore`, {
		method: 'PATCH',
	});
};

export const getUser = async (id: number) => {
	const response: ResponseFetch<DataSourceModel<'users'>> =
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

	const response: ResponseFetch<GetUserPermissionsType> =
		await new ApiRequest().doFetch(
			`/users/${user_id}/permissions?${query}`,
		);

	return getResponseData(response);
};

export const createUserPermissions = async (
	user_id: number,
	permission_ids: number[],
): Promise<ResponseFetch<{ permission_id: number; message: string }[]>> => {
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
): Promise<ResponseFetch<null>> => {
	return await new ApiRequest().doFetch(
		`/users/${user_id}/permissions/${permission_id}`,
		{
			method: 'DELETE',
		},
	);
};
