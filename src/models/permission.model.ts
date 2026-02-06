export const PermissionEntitiesSuggestions = [
	'cron_history',
	'log_data',
	'log_history',
	'mail_queue',
	'permission',
	'template',
	'user',
];

export const PermissionOperationSuggestions = [
	'create',
	'update',
	'read',
	'find',
	'delete',
];

export type PermissionModel<D = Date | string> = {
	id: number;
	entity: string;
	operation: string;
	deleted_at: D | undefined;
};

export type PermissionFormValuesType = {
	entity: string;
	operation: string;
};
