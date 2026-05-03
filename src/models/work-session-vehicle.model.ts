import {
	type CompanyVehicleModel,
	getCompanyVehicleDisplayName,
} from '@/models/company-vehicle.model';
import type { WorkSessionModel } from '@/models/work-session.model';

export const WorkSessionVehicleStatusEnum = {
	ASSIGNED: 'assigned',
	RETURNED: 'returned',
} as const;

export type WorkSessionVehicleStatus =
	(typeof WorkSessionVehicleStatusEnum)[keyof typeof WorkSessionVehicleStatusEnum];

export type WorkSessionVehicleModel<D = Date | string> = {
	id: number;

	work_session: WorkSessionModel;
	company_vehicle: CompanyVehicleModel;

	vehicle_km_start: number;
	vehicle_km_end: number | null;

	status: WorkSessionVehicleStatus;

	assigned_at: D;
	returned_at: D | null;

	notes: string | null;

	created_at: D;
	updated_at: D | null;
};

export type WorkSessionVehicleFormValuesType = {
	work_session_id: number | null;

	company_vehicle_id: number | null;
	company_vehicle: string | null;

	vehicle_km_start: number | null;
	vehicle_km_end: number | null;

	notes: string | null;
};

export function getWorkSessionVehicleDisplayName(
	entry: WorkSessionVehicleModel,
) {
	return `#${entry.work_session.id} ${getCompanyVehicleDisplayName(entry.company_vehicle)}`;
}
