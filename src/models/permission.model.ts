export const PermissionEntitiesSuggestions = [
	'address',
	'brand',
	'cash-flow',
	'client',
	'cmr',
	'cmr-session',
	'cmr-vehicle',
	'company-vehicle',
	'cron-history',
	'log-data',
	'log-history',
	'mail-queue',
	'permission',
	'place',
	'template',
	'user',
	'vehicle',
	'vendor',
	'work-session',
	'work-session-vehicle',
] as const;

export const PermissionOperationSuggestions = [
	'create',
	'update',
	'read',
	'find',
	'delete',
	'refund',
] as const;

export type PermissionEntityType =
	(typeof PermissionEntitiesSuggestions)[number] | 'dashboard';
export type PermissionOperationType =
	(typeof PermissionOperationSuggestions)[number];

export type PermissionModel<D = Date | string> = {
	id: number;
	entity: PermissionEntityType;
	operation: PermissionOperationType;
	deleted_at: D | undefined;
};
