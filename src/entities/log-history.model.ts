export enum LogHistorySource {
	CRON = 'cron',
	API = 'api',
	SEED = 'seed',
	UNKNOWN = 'unknown',
}

export const LogHistoryEntities = ['permission', 'template', 'user'];
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
