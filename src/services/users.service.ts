import {
	ApiRequest,
	buildQueryString,
	getResponseData,
} from '@/helpers/api.helper';
import type { UserPermissionModel } from '@/models/user-permission.model';
import type { FindFunctionParamsType } from '@/types/action.type';
import type { ApiResponseFetch, QueryFiltersType } from '@/types/api.type';

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
	const query = buildQueryString(params as QueryFiltersType);

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
