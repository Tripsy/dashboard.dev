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
import type { BrandFormValuesType, BrandModel } from '@/models/brand.model';
import type { ApiResponseFetch } from '@/types/api.type';

export const findBrands: FindFunctionType<BrandModel> = async (
	params: FindFunctionParamsType,
) => {
	const query = buildQueryString(params);

	const response: ApiResponseFetch<FindFunctionResponseType<BrandModel>> =
		await new ApiRequest().doFetch(`/brands?${query}`);

	return getResponseData(response);
};

export const createBrand: CreateFunctionType<
	BrandModel,
	BrandFormValuesType
> = async (params: BrandFormValuesType) => {
	return await new ApiRequest().doFetch('/brands', {
		method: 'POST',
		body: JSON.stringify(params),
	});
};

export const updateBrand: UpdateFunctionType<
	BrandModel,
	BrandFormValuesType
> = async (params: BrandFormValuesType, id: number) => {
	return await new ApiRequest().doFetch(`/brands/${id}`, {
		method: 'PUT',
		body: JSON.stringify(params),
	});
};

export const deleteBrand: DeleteFunctionType = async (ids: number[]) => {
	const id = ids[0];

	return await new ApiRequest().doFetch(`/brands/${id}`, {
		method: 'DELETE',
	});
};
