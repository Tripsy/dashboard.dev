import type { CmrModel } from '@/models/cmr.model';
import type { WorkSessionModel } from '@/models/work-session.model';

export type CmrSessionModel<D = Date | string> = {
	id: number;

	cmr: CmrModel;
	work_session: WorkSessionModel;

	created_at: D;
};

export function displayCmrSessionLabel(entry: CmrSessionModel) {
	return `CMR${entry.cmr.id} ${entry.work_session.user.name}`;
}
