import {
	ApiRequest,
	buildQueryString,
	getResponseData,
} from '@/helpers/api.helper';
import type { ClientFormValuesType, ClientModel } from '@/models/client.model';
import type {
	CreateFunctionType,
	DeleteFunctionType,
	FindFunctionParamsType,
	FindFunctionResponseType,
	FindFunctionType,
	UpdateFunctionType,
} from '@/types/action.type';
import type { ApiResponseFetch, QueryFiltersType } from '@/types/api.type';

export const findClients: FindFunctionType<ClientModel> = async (
	params: FindFunctionParamsType,
) => {
	const query = buildQueryString(params as QueryFiltersType);

	const response: ApiResponseFetch<FindFunctionResponseType<ClientModel>> =
		await new ApiRequest().doFetch(`/clients?${query}`);

	return getResponseData(response);
};

export const createClient: CreateFunctionType<
	ClientModel,
	ClientFormValuesType
> = async (params: ClientFormValuesType) => {
	return await new ApiRequest().doFetch('/clients', {
		method: 'POST',
		body: JSON.stringify(params),
	});
};

export const updateClient: UpdateFunctionType<
	ClientModel,
	ClientFormValuesType
> = async (params: ClientFormValuesType, id: number) => {
	return await new ApiRequest().doFetch(`/clients/${id}`, {
		method: 'PUT',
		body: JSON.stringify(params),
	});
};

export const deleteClient: DeleteFunctionType = async (ids: number[]) => {
	const id = ids[0];

	return await new ApiRequest().doFetch(`/clients/${id}`, {
		method: 'DELETE',
	});
};

export const enableClient = async (
	ids: number[],
): Promise<ApiResponseFetch<null>> => {
	const id = ids[0];

	return await new ApiRequest().doFetch(`/clients/${id}/status/active`, {
		method: 'PATCH',
	});
};

export const disableClient = async (
	ids: number[],
): Promise<ApiResponseFetch<null>> => {
	const id = ids[0];

	return await new ApiRequest().doFetch(`/clients/${id}/status/inactive`, {
		method: 'PATCH',
	});
};

export const restoreClient = async (
	ids: number[],
): Promise<ApiResponseFetch<null>> => {
	const id = ids[0];

	return await new ApiRequest().doFetch(`/clients/${id}/restore`, {
		method: 'PATCH',
	});
};
