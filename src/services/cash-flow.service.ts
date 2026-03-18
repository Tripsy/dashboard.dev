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
	CashFlowFormValuesType,
	CashFlowModel,
} from '@/models/cash-flow.model';
import type { ApiResponseFetch } from '@/types/api.type';

export const findCashFlows: FindFunctionType<CashFlowModel> = async (
	params: FindFunctionParamsType,
) => {
	const query = buildQueryString(params);

	const response: ApiResponseFetch<
		FindFunctionResponseType<CashFlowModel>
	> = await new ApiRequest().doFetch(`/cash-flow?${query}`);

	return getResponseData(response);
};

export const createCashFlow: CreateFunctionType<
	CashFlowModel,
	CashFlowFormValuesType
> = async (params: CashFlowFormValuesType) => {
	return await new ApiRequest().doFetch('/cash-flow', {
		method: 'POST',
		body: JSON.stringify(params),
	});
};

export const updateCashFlow: UpdateFunctionType<
	CashFlowModel,
	CashFlowFormValuesType
> = async (params: CashFlowFormValuesType, id: number) => {
	return await new ApiRequest().doFetch(`/cash-flow/${id}`, {
		method: 'PUT',
		body: JSON.stringify(params),
	});
};

export const deleteCashFlow: DeleteFunctionType = async (ids: number[]) => {
	const id = ids[0];

	return await new ApiRequest().doFetch(`/cash-flow/${id}`, {
		method: 'DELETE',
	});
};
