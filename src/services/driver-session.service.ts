import { ApiRequest } from '@/helpers/api.helper';
import type { CompanyVehicleModel } from '@/models/company-vehicle.model';
import type { ApiResponseFetch } from '@/types/api.type';
import type { WorkSessionType } from '@/types/auth.type';

export async function requestActiveWorkSession(): Promise<WorkSessionType | null> {
	try {
		const fetchResponse: ApiResponseFetch<WorkSessionType> =
			await new ApiRequest().doFetch('/driver-session/active', {
				method: 'GET',
			});

		if (fetchResponse?.success) {
			return fetchResponse.data || null;
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
		const fetchResponse: ApiResponseFetch<CompanyVehicleModel[]> =
			await new ApiRequest().doFetch(
				'/driver-session/available-company-vehicles',
				{
					method: 'GET',
				},
			);

		if (fetchResponse?.success) {
			return fetchResponse.data || null;
		}
	} catch (error: unknown) {
		console.error(error);
	}

	return null;
}

// export async function requestSessionCmrs(): Promise<
// 	CmrSessionModel[] | null
// > {
// 	try {
// 		const fetchResponse: ApiResponseFetch<CompanyVehicleModel[]> =
// 			await new ApiRequest().doFetch(
// 				'/driver-session/available-company-vehicles',
// 				{
// 					method: 'GET',
// 				},
// 			);
//
// 		if (fetchResponse?.success) {
// 			return fetchResponse.data || null;
// 		}
// 	} catch (error: unknown) {
// 		console.error(error);
// 	}
//
// 	return null;
// }
