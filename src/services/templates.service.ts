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
	TemplateFormValuesType,
	TemplateModel,
} from '@/models/template.model';
import type { ApiResponseFetch } from '@/types/api.type';

export const findTemplates: FindFunctionType<TemplateModel> = async (
	params: FindFunctionParamsType,
) => {
	const query = buildQueryString(params);

	const response: ApiResponseFetch<FindFunctionResponseType<TemplateModel>> =
		await new ApiRequest().doFetch(`/templates?${query}`);

	return getResponseData(response);
};

export const createTemplate: CreateFunctionType<
	TemplateModel,
	TemplateFormValuesType
> = async (params: TemplateFormValuesType) => {
	return await new ApiRequest().doFetch('/templates', {
		method: 'POST',
		body: JSON.stringify(params),
	});
};

export const updateTemplate: UpdateFunctionType<
	TemplateModel,
	TemplateFormValuesType
> = async (params: TemplateFormValuesType, id: number) => {
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
	const response: ApiResponseFetch<TemplateModel> =
		await new ApiRequest().doFetch(`/templates/${id}`);

	return getResponseData(response);
};
