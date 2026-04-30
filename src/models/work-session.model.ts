import { dateDiff } from '@/helpers/date.helper';
import type { UserModel } from '@/models/user.model';
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
};

export type WorkSessionFormValuesType = {
	user_id: number | null;
	user: string | null;
	start_at: string | null;
	start_at_time: string | null;
	end_at_time: string | null;
};

export function displayWorkSessionDuration(entry: WorkSessionModel) {
	if (!entry.end_at) {
		return 'n/a';
	}

	return dateDiff(entry.start_at, entry.end_at, 'display');
}
