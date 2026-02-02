import { z } from 'zod';
import type {
	DataSourceType,
	DataTableColumnType,
	FormStateType,
} from '@/config/data-source';
import { translateBatch } from '@/config/lang';
import type { PermissionModel } from '@/entities/permission.model';
import {
	createPermissions,
	deletePermissions,
	findPermissions,
	restorePermissions,
	updatePermissions,
} from '@/services/permissions.service';

const translations = await translateBatch([
	'permissions.validation.entity_invalid',
	'permissions.validation.operation_invalid',
	'permissions.data_table.column_id',
	'permissions.data_table.column_entity',
	'permissions.data_table.column_operation',
]);

const ValidateSchemaBasePermissions = z.object({
	entity: z.string().trim().nonempty({
		message: translations['permissions.validation.entity_invalid'],
	}),
	operation: z.string().trim().nonempty({
		message: translations['permissions.validation.operation_invalid'],
	}),
});

const DataTableColumnsPermissions: DataTableColumnType<PermissionModel>[] = [
	{
		field: 'id',
		header: translations['permissions.data_table.column_id'],
		sortable: true,
	},
	{
		field: 'entity',
		header: translations['permissions.data_table.column_entity'],
		sortable: true,
	},
	{
		field: 'operation',
		header: translations['permissions.data_table.column_operation'],
		sortable: true,
	},
];

const DataTablePermissionsFilters = {
	global: { value: null, matchMode: 'contains' },
	is_deleted: { value: null, matchMode: 'equals' },
};

export type DataSourcePermissionsType = {
	tableFilter: typeof DataTablePermissionsFilters;
	model: PermissionModel;
	formState: FormStateType<'permissions'>;
	formValues: {
		entity: string;
		operation: string;
	};
};

export const DataSourceConfigPermissions = {
	dataTableState: {
		reloadTrigger: 0,
		first: 0,
		rows: 10,
		sortField: 'id',
		sortOrder: -1 as const,
		filters: DataTablePermissionsFilters,
	},
	dataTableColumns: DataTableColumnsPermissions,
	formState: {
		dataSource: 'permissions' as const,
		id: undefined,
		values: {
			entity: '',
			operation: '',
		},
		errors: {},
		message: null,
		situation: null,
	},
	functions: {
		find: findPermissions,
		getFormValues: (
			formData: FormData,
		): DataSourceType['permissions']['formValues'] => {
			return {
				entity: formData.get('entity') as string,
				operation: formData.get('operation') as string,
			};
		},
		validateForm: (values: DataSourceType['permissions']['formValues']) => {
			return ValidateSchemaBasePermissions.safeParse(values);
		},
		syncFormState: (
			state: FormStateType<'permissions'>,
			model: PermissionModel,
		): FormStateType<'permissions'> => {
			return {
				...state,
				id: model.id,
				values: {
					...state.values,
					entity: model.entity,
					operation: model.operation,
				},
			};
		},
		displayActionEntries: (entries: PermissionModel[]) => {
			return entries.map((entry) => ({
				id: entry.id,
				label: `${entry.entity}.${entry.operation}`,
			}));
		},
	},
	actions: {
		create: {
			mode: 'form' as const,
			permission: 'permission.create',
			allowedEntries: 'free' as const,
			position: 'right' as const,
			function: createPermissions,
			button: {
				className: 'btn btn-action-create',
			},
		},
		update: {
			mode: 'form' as const,
			permission: 'permission.update',
			allowedEntries: 'single' as const,
			position: 'left' as const,
			function: updatePermissions,
			button: {
				className: 'btn btn-action-update',
			},
		},
		delete: {
			mode: 'action' as const,
			permission: 'permission.delete',
			allowedEntries: 'single' as const,
			position: 'left' as const,
			customEntryCheck: (entry: PermissionModel) => !entry.deleted_at, // Return true if the entry is not deleted
			function: deletePermissions,
			button: {
				className: 'btn btn-action-delete',
			},
		},
		restore: {
			mode: 'action' as const,
			permission: 'permission.delete',
			allowedEntries: 'single' as const,
			position: 'left' as const,
			customEntryCheck: (entry: PermissionModel) => !!entry.deleted_at, // Return true if the entry is deleted
			function: restorePermissions,
			button: {
				className: 'btn btn-action-restore',
			},
		},
	},
};
