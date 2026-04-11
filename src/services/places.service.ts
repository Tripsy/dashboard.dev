import {
	ApiRequest,
	buildQueryString,
	getResponseData,
} from '@/helpers/api.helper';
import type { PlaceFormValuesType, PlaceModel } from '@/models/place.model';
import type {
	CreateFunctionType,
	DeleteFunctionType,
	FindFunctionParamsType,
	FindFunctionResponseType,
	FindFunctionType,
	UpdateFunctionType,
} from '@/types/action.type';
import type { ApiResponseFetch, QueryFiltersType } from '@/types/api.type';

export const findPlaces: FindFunctionType<PlaceModel> = async (
	params: FindFunctionParamsType,
) => {
	const query = buildQueryString(params as QueryFiltersType);

	const response: ApiResponseFetch<FindFunctionResponseType<PlaceModel>> =
		await new ApiRequest().doFetch(`/places?${query}`);

	return getResponseData(response);
};

export const createPlace: CreateFunctionType<
	PlaceModel,
	PlaceFormValuesType
> = async (params: PlaceFormValuesType) => {
	return await new ApiRequest().doFetch('/places', {
		method: 'POST',
		body: JSON.stringify(params),
	});
};

export const updatePlace: UpdateFunctionType<
	PlaceModel,
	PlaceFormValuesType
> = async (params: PlaceFormValuesType, id: number) => {
	return await new ApiRequest().doFetch(`/places/${id}`, {
		method: 'PUT',
		body: JSON.stringify(params),
	});
};

export const deletePlace: DeleteFunctionType = async (ids: number[]) => {
	const id = ids[0];

	return await new ApiRequest().doFetch(`/places/${id}`, {
		method: 'DELETE',
	});
};
