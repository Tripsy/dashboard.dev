export const LogHistorySourceEnum = {
	CRON: 'cron',
	API: 'api',
	SEED: 'seed',
	UNKNOWN: 'unknown',
} as const;

export type LogHistorySource =
	(typeof LogHistorySourceEnum)[keyof typeof LogHistorySourceEnum];

export const LogHistoryEntities = [
	'address',
	'brand',
	'cash_flow',
	'client',
	'cmr',
	'company-vehicle',
	'permission',
	'place',
	'template',
	'user',
	'vehicle',
	'work-session',
	'work-session-vehicle',
];
export const LogHistoryActions = ['created', 'updated', 'deleted'];

export type LogHistoryModel<D = Date | string> = {
	id: number;

	entity: string;
	entity_id: number;
	action: string;

	auth_id: number | null;
	performed_by: string;

	request_id: string;
	source: LogHistorySource;

	recorded_at: D;

	details?: Record<string, unknown>;
};
