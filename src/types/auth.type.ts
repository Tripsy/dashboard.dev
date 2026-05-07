import type { WorkSessionModel } from '@/models/work-session.model';
import type { WorkSessionVehicleModel } from '@/models/work-session-vehicle.model';

export type AuthTokenType = {
	ident: string;
	label: string;
	used_at: Date;
	used_now: boolean; // true - if is a match for the current session
};

export type WorkSessionType = WorkSessionModel & {
	work_session_vehicle?: WorkSessionVehicleModel[];
};
