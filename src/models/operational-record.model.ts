import type { CashFlowModel } from '@/models/cash-flow.model';
import type { ClientModel } from '@/models/client.model';
import type { CmrModel } from '@/models/cmr.model';
import type { CompanyVehicleModel } from '@/models/company-vehicle.model';
import type { UserModel } from '@/models/user.model';

export const OperationalRecordStatusEnum = {
	DRAFT: 'draft',
	RECORDED: 'recorded',
} as const;

export type OperationalRecordStatus =
	(typeof OperationalRecordStatusEnum)[keyof typeof OperationalRecordStatusEnum];

export type OperationalRecordModel<D = Date | string> = {
	id: number;

	cash_flow: CashFlowModel;

	status: OperationalRecordStatus;

	cmr: CmrModel | null;
	user: UserModel | null;
	company_vehicle: CompanyVehicleModel | null;
	client: ClientModel | null;

	recorded_at: D;

	notes: string | null;

	created_at: D;
	updated_at: D;
	deleted_at: D;
};

// export type OperationalRecordFormValuesType = Pick<
// 	OperationalRecordModel,
// 	| 'cash_flow_id'
// 	| 'status'
// 	| 'cmr_id'
// 	| 'driver_id'
// 	| 'company_vehicle_id'
// 	| 'client_id'
// > & {
// 	cash_flow_id: number | null;
// 	cash_
// 	recorded_at: string | null;
// 	notes: string | null;
// };
