import { dateDiff, formatDate } from '@/helpers/date.helper';
import type { UserModel } from '@/models/user.model';
import type { WorkSessionVehicleModel } from '@/models/work-session-vehicle.model';
import type { StatusTransitions } from '@/types/common.type';

export const WorkSessionStatusEnum = {
	ACTIVE: 'active',
	CLOSED: 'closed',
} as const;

export type WorkSessionStatus =
	(typeof WorkSessionStatusEnum)[keyof typeof WorkSessionStatusEnum];

// Allowed status transition configuration
export const STATUS_TRANSITIONS: StatusTransitions<WorkSessionStatus> = {
	[WorkSessionStatusEnum.ACTIVE]: [WorkSessionStatusEnum.CLOSED],
	[WorkSessionStatusEnum.CLOSED]: [],
};

export type WorkSessionModel<D = Date | string> = {
	id: number;

	user: UserModel;

	status: WorkSessionStatus;

	start_at: D;
	end_at: D | null;

	created_at: D;
	updated_at: D;
	deleted_at: D;

	work_session_vehicle?: WorkSessionVehicleModel[];
};

export type WorkSessionFormValuesType = {
	user_id: number | null;
	user: string | null;
	start_at: string | null;
	start_at_time: string | null;
	end_at_time: string | null;
};

export const START_AT_MAX_PAST_SECONDS = 1800;
export const END_AT_MAX_FUTURE_SECONDS = 1800;

export function displayWorkSessionDuration(entry: WorkSessionModel) {
	if (!entry.end_at) {
		return 'n/a';
	}

	return dateDiff(entry.start_at, entry.end_at, 'display');
}

export function getWorkSessionDisplayName(entry: WorkSessionModel) {
	return `${entry.user.name} ${formatDate(entry.start_at, 'date-time')}`;
}
