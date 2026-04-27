export const WorkSessionStatusEnum = {
	ACTIVE: 'active',
	CLOSED: 'closed',
} as const;

export type WorkSessionStatus =
	(typeof WorkSessionStatusEnum)[keyof typeof WorkSessionStatusEnum];

export type WorkSessionModel<D = Date | string> = {
	id: number;

	user_id: number;

	status: WorkSessionStatus;

	start_at: D;
	end_at: D | null;

	created_at: D;
	updated_at: D;
	deleted_at: D;
};

export type WorkSessionFormValuesType = Pick<
	WorkSessionModel,
	'user_id' | 'status'
> & {
	start_at: string | null;
	end_at: string | null;
};
