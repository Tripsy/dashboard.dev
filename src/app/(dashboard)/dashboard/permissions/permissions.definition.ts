import { z } from 'zod';
import type { FormStateType } from '@/config/data-source.config';
import { BaseValidator } from '@/helpers/validator.helper';
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

const validatorMessages = await BaseValidator.getValidatorMessages(
	[
		'invalid_entity',
		'invalid_operation',
	] as const,
	'permissions.validation',
);

class PermissionValidator extends BaseValidator<typeof validatorMessages> {
	manage = z.object({
		entity: this.validateString(this.getMessage('invalid_entity')),
		operation: this.validateString(
			this.getMessage('invalid_operation'),
		),
	});
}

function getFormValuesPermission(formData: FormData): PermissionFormValuesType {
	return {
		entity: formData.get('entity') as string,
		operation: formData.get('operation') as string,
	};
}

export type PermissionDataTableFiltersType = {
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
			header: 'ID',
			sortable: true,
		},
		{
			field: 'entity',
			header: 'Entity',
			sortable: true,
		},
		{
			field: 'operation',
			header: 'Operation',
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
			const validator = new PermissionValidator(validatorMessages);

			return validator.manage.safeParse(values);
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
			buttonProps: {
				variant: 'info' as const,
			},
		},
		update: {
			mode: 'form' as const,
			permission: 'permission.update',
			allowedEntries: 'single' as const,
			position: 'left' as const,
			function: updatePermissions,
			buttonProps: {
				variant: 'outline' as const,
				hover: 'success' as const,
			},
		},
		delete: {
			mode: 'action' as const,
			permission: 'permission.delete',
			allowedEntries: 'single' as const,
			position: 'left' as const,
			customEntryCheck: (entry: PermissionModel) => !entry.deleted_at, // Return true if the entry is not deleted
			function: deletePermissions,
			buttonProps: {
				variant: 'outline' as const,
				hover: 'error' as const,
			},
		},
		restore: {
			mode: 'action' as const,
			permission: 'permission.delete',
			allowedEntries: 'single' as const,
			position: 'left' as const,
			customEntryCheck: (entry: PermissionModel) => !!entry.deleted_at, // Return true if the entry is deleted
			function: restorePermissions,
			buttonProps: {
				variant: 'outline' as const,
				hover: 'info' as const,
			},
		},
	},
};
