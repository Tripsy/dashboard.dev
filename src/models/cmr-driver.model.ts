export const CmrDriverRoleEnum = {
	PRIMARY: 'primary',
	SECONDARY: 'secondary',
} as const;

export type CmrDriverRole =
	(typeof CmrDriverRoleEnum)[keyof typeof CmrDriverRoleEnum];

export type CmrDriverModel<D = Date | string> = {
	id: number;

	cmr_id: number;
	work_session_id: number;

	role: CmrDriverRole;

	created_at: D;
};

export type CmrDriverFormValuesType = Pick<
	CmrDriverModel,
	'cmr_id' | 'work_session_id' | 'role'
>;
