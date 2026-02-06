import { z } from 'zod';
import type {
	DataTableFiltersType,
	FormStateType,
} from '@/config/data-source.config';
import { translateBatch } from '@/config/translate.setup';
import type {
	PermissionFormValuesType,
	PermissionModel,
} from '@/models/permission.model';
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

function getFormValuesPermission(formData: FormData): PermissionFormValuesType {
	return {
		entity: formData.get('entity') as string,
		operation: formData.get('operation') as string,
	};
}

export type PermissionDataTableFiltersType = DataTableFiltersType & {
	global: { value: string | null; matchMode: 'contains' };
	is_deleted: { value: boolean; matchMode: 'equals' };
};

export const permissionDataTableFilters: PermissionDataTableFiltersType = {
	global: { value: null, matchMode: 'contains' },
	is_deleted: { value: false, matchMode: 'equals' },
};

export const dataSourceConfigPermissions = {
	dataTableState: {
		reloadTrigger: 0,
		first: 0,
		rows: 10,
		sortField: 'id',
		sortOrder: -1 as const,
		filters: permissionDataTableFilters,
	},
	dataTableColumns: [
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
	],
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
		getFormValues: getFormValuesPermission,
		validateForm: (values: PermissionFormValuesType) => {
			return ValidateSchemaBasePermissions.safeParse(values);
		},
		syncFormState: (
			state: FormStateType<
				'permissions',
				PermissionModel,
				PermissionFormValuesType
			>,
			model: PermissionModel,
		): FormStateType<
			'permissions',
			PermissionModel,
			PermissionFormValuesType
		> => {
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
