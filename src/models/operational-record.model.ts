import { formatDate } from '@/helpers/date.helper';
import type { CashFlowModel } from '@/models/cash-flow.model';
import type { ClientModel } from '@/models/client.model';
import type { CmrModel } from '@/models/cmr.model';
import type { CompanyVehicleModel } from '@/models/company-vehicle.model';
import type { UserModel } from '@/models/user.model';
import { WorkSessionModel } from '@/models/work-session.model';

export type OperationalRecordModel<D = Date | string> = {
	id: number;

	cash_flow: CashFlowModel;
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

export function displayOperationalRecordLabel(
	entry: OperationalRecordModel,
): string {
	return `${entry.id} ${formatDate(entry.recorded_at, 'date-time')}`;
}
