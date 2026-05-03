import { ApiRequest } from '@/helpers/api.helper';
import type {
	WorkSessionVehicleFormValuesType,
	WorkSessionVehicleModel,
} from '@/models/work-session-vehicle.model';
import type { ApiResponseFetch } from '@/types/api.type';

export const createWorkSessionVehicle = async (
	params: Partial<WorkSessionVehicleFormValuesType>,
	work_session_id: number | null,
): Promise<ApiResponseFetch<WorkSessionVehicleModel>> => {
	return await new ApiRequest().doFetch(
		`/work-session-vehicles/${work_session_id}`,
		{
			method: 'POST',
			body: JSON.stringify(params),
		},
	);
};

export async function updateWorkSessionVehicle(
	params: Partial<WorkSessionVehicleFormValuesType>,
	id: number,
	work_session_id: number | null,
): Promise<ApiResponseFetch<WorkSessionVehicleModel>> {
	return await new ApiRequest().doFetch(
		`/work-session-vehicles/${work_session_id}/${id}`,
		{
			method: 'PUT',
			body: JSON.stringify(params),
		},
	);
}

export async function updateStatusWorkSessionVehicle(
	entry: WorkSessionVehicleModel,
	status: string,
): Promise<ApiResponseFetch<null>> {
	return await new ApiRequest().doFetch(
		`/work-session-vehicles/${entry.work_session.id}/${entry.id}/status/${status}`,
		{
			method: 'PATCH',
		},
	);
}

export async function deleteWorkSessionVehicle(
	entry: WorkSessionVehicleModel,
): Promise<ApiResponseFetch<null>> {
	return await new ApiRequest().doFetch(
		`/work-session-vehicles/${entry.work_session.id}/${entry.id}`,
		{
			method: 'DELETE',
		},
	);
}
