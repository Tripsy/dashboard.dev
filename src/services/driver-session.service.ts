import { ApiRequest, buildQueryString } from '@/helpers/api.helper';
import type { CashFlowModel } from '@/models/cash-flow.model';
import type { CompanyVehicleModel } from '@/models/company-vehicle.model';
import type { ApiResponseFetch } from '@/types/api.type';
import type { WorkSessionType } from '@/types/auth.type';

export async function requestActiveWorkSession(): Promise<WorkSessionType | null> {
	try {
		const response: ApiResponseFetch<WorkSessionType> =
			await new ApiRequest().doFetch('/driver-session/active', {
				method: 'GET',
			});

		if (response?.success) {
			return response.data || null;
		}
	} catch (error: unknown) {
		console.error(error);
	}

	return null;
}

export async function requestAvailableCompanyVehicles(): Promise<
	CompanyVehicleModel[] | null
> {
	try {
		const response: ApiResponseFetch<CompanyVehicleModel[]> =
			await new ApiRequest().doFetch(
				'/driver-session/available-company-vehicles',
				{
					method: 'GET',
				},
			);

		if (response?.success) {
			return response.data || null;
		}
	} catch (error: unknown) {
		console.error(error);
	}

	return null;
}

export async function requestSessionCashFlowEntries(params: {
	user_id: number;
	create_at_start: Date | null;
}): Promise<CashFlowModel[] | null> {
	try {
		const query = buildQueryString({
			...params,
			create_at_start: params.create_at_start?.toISOString(),
		});

		const response: ApiResponseFetch<CashFlowModel[]> =
			await new ApiRequest().doFetch(
				`/driver-session/session-cash-flow-entries?${query}`,
				{
					method: 'GET',
				},
			);

		if (response?.success) {
			return response.data || null;
		}
	} catch (error: unknown) {
		console.error(error);
	}

	return null;
}

type DriverCashBalanceType = {
	currency: string;
	balance: number;
};

export async function requestDriverCashBalance(
	user_id: number,
	currency: string,
): Promise<DriverCashBalanceType | null> {
	try {
		const response: ApiResponseFetch<DriverCashBalanceType> =
			await new ApiRequest().doFetch(
				`/driver-session/driver-cash-balance/${user_id}/${currency}`,
				{
					method: 'GET',
				},
			);

		if (response?.success) {
			return response.data || null;
		}
	} catch (error: unknown) {
		console.error(error);
	}

	return null;
}
