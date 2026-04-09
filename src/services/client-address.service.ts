import {
	ApiRequest,
	buildQueryString,
	getResponseData,
} from '@/helpers/api.helper';
import type {
	ClientAddressFormValuesType,
	ClientAddressModel,
} from '@/models/client-address.model';
import type {
	CreateFunctionType,
	DeleteFunctionType,
	FindFunctionParamsType,
	FindFunctionResponseType,
	FindFunctionType,
	UpdateFunctionType,
} from '@/types/action-function.type';
import type { ApiResponseFetch, QueryFiltersType } from '@/types/api.type';

export const findClientAddress: FindFunctionType<ClientAddressModel> = async (
	params: FindFunctionParamsType,
) => {
	const query = buildQueryString(params as QueryFiltersType);

	const response: ApiResponseFetch<
		FindFunctionResponseType<ClientAddressModel>
	> = await new ApiRequest().doFetch(`/client-address?${query}`);

	return getResponseData<FindFunctionResponseType<ClientAddressModel>>(
		response,
	);
};

export const createClientAddress: CreateFunctionType<
	ClientAddressModel,
	ClientAddressFormValuesType
> = async (params: ClientAddressFormValuesType) => {
	return await new ApiRequest().doFetch('/client-address', {
		method: 'POST',
		body: JSON.stringify(params),
	});
};

export const updateClientAddress: UpdateFunctionType<
	ClientAddressModel,
	ClientAddressFormValuesType
> = async (params: ClientAddressFormValuesType, id: number) => {
	return await new ApiRequest().doFetch(`/client-address/${id}`, {
		method: 'PUT',
		body: JSON.stringify(params),
	});
};

export const deleteClientAddress: DeleteFunctionType = async (
	ids: number[],
) => {
	const id = ids[0];

	return await new ApiRequest().doFetch(`/client-address/${id}`, {
		method: 'DELETE',
	});
};

export const restoreClientAddress = async (
	ids: number[],
): Promise<ApiResponseFetch<null>> => {
	const id = ids[0];

	return await new ApiRequest().doFetch(`/client-address/${id}/restore`, {
		method: 'PATCH',
	});
};

export const getClientAddress = async (id: number) => {
	const response: ApiResponseFetch<ClientAddressModel> =
		await new ApiRequest().doFetch(`/client-address/${id}`);

	return getResponseData(response);
};
