import { z } from 'zod';
import { FormManagePermission } from '@/app/(dashboard)/dashboard/permissions/form-manage-permission.component';
import { getFormDataAsString } from '@/helpers/form.helper';
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
	['invalid_entity', 'invalid_operation'] as const,
	'permissions.validation',
);

class PermissionValidator extends BaseValidator<typeof validatorMessages> {
	manage = z.object({
		entity: this.validateString(this.getMessage('invalid_entity')),
		operation: this.validateString(this.getMessage('invalid_operation')),
	});
}

function getFormValuesPermission(formData: FormData): PermissionFormValuesType {
	return {
		entity: getFormDataAsString(formData, 'entity'),
		operation: getFormDataAsString(formData, 'operation'),
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
		getFormState: (
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
			windowType: 'form' as const,
			component: FormManagePermission,
			modalProps: {
				size: 'xl' as const,
			},
			permission: 'permission.create',
			entriesSelection: 'free' as const,
			actionPosition: 'right' as const,
			operationFunction: createPermissions,
			button: {
				variant: 'info' as const,
			},
		},
		update: {
			windowType: 'form' as const,
			component: FormManagePermission,
			modalProps: {
				size: 'xl' as const,
			},
			permission: 'permission.update',
			entriesSelection: 'single' as const,
			actionPosition: 'left' as const,
			operationFunction: updatePermissions,
			button: {
				variant: 'outline' as const,
				hover: 'success' as const,
			},
		},
		delete: {
			windowType: 'action' as const,
			permission: 'permission.delete',
			entriesSelection: 'single' as const,
			actionPosition: 'left' as const,
			customEntryCheck: (entry: PermissionModel) => !entry.deleted_at, // Return true if the entry is not deleted
			operationFunction: deletePermissions,
			button: {
				variant: 'outline' as const,
				hover: 'error' as const,
			},
		},
		restore: {
			windowType: 'action' as const,
			permission: 'permission.delete',
			entriesSelection: 'single' as const,
			actionPosition: 'left' as const,
			customEntryCheck: (entry: PermissionModel) => !!entry.deleted_at, // Return true if the entry is deleted
			operationFunction: restorePermissions,
			button: {
				variant: 'outline' as const,
				hover: 'info' as const,
			},
		},
	},
};
