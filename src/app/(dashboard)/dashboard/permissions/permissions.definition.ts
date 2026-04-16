import { z } from 'zod';
import {
	type DataTableColumnType,
	DataTableValue,
} from '@/app/(dashboard)/_components/data-table-value';
import { FormManagePermission } from '@/app/(dashboard)/dashboard/permissions/form-manage-permission.component';
import type { DataSourceConfigType } from '@/config/data-source.config';
import { translateBatch } from '@/config/translate.setup';
import { getFormDataAsString } from '@/helpers/form.helper';
import {
	requestCreate,
	requestDelete,
	requestFind,
	requestRestore,
	requestUpdate,
} from '@/helpers/services.helper';
import { BaseValidator } from '@/helpers/validator.helper';
import type {
	PermissionFormValuesType,
	PermissionModel,
} from '@/models/permission.model';
import type { FindFunctionParamsType } from '@/types/action.type';
import type { FormStateType } from '@/types/form.type';

const translations = await translateBatch(
	['create.title', 'update.title', 'delete.title', 'restore.title'],
	'permissions.action',
);

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

function validateForm(values: PermissionFormValuesType) {
	const validator = new PermissionValidator(validatorMessages);

	return validator.manage.safeParse(values);
}

function getFormValues(formData: FormData): PermissionFormValuesType {
	return {
		entity: getFormDataAsString(formData, 'entity'),
		operation: getFormDataAsString(formData, 'operation'),
	};
}

function getFormState(
	data?: PermissionModel,
): FormStateType<PermissionFormValuesType> {
	return {
		errors: {},
		message: null,
		situation: null,
		values: {
			entity: data?.entity ?? null,
			operation: data?.operation ?? null,
		},
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

export const dataSourceConfigPermissions: DataSourceConfigType<
	PermissionModel,
	PermissionFormValuesType
> = {
	dataTable: {
		state: {
			first: 0,
			rows: 10,
			sortField: 'id',
			sortOrder: -1 as const,
			filters: permissionDataTableFilters,
		},
		columns: [
			{
				field: 'id',
				header: 'ID',
				sortable: true,
				body: (
					entry: PermissionModel,
					column: DataTableColumnType<PermissionModel>,
				) =>
					DataTableValue(entry, column, {
						markDeleted: true,
					}),
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
		find: (params: FindFunctionParamsType) =>
			requestFind<PermissionModel>('permissions', params),
	},
	displayEntryLabel: (entry: PermissionModel) => {
		return `${entry.entity}.${entry.operation}`;
	},
	actions: {
		create: {
			windowType: 'form',
			windowTitle: translations['create.title'],
			windowComponent: FormManagePermission,
			windowConfigProps: {
				size: 'xl',
			},
			permission: 'permission.create',
			entriesSelection: 'free',
			operationFunction: (params: PermissionFormValuesType) =>
				requestCreate<PermissionModel, PermissionFormValuesType>(
					'permissions',
					params,
				),
			buttonPosition: 'right',
			button: {
				variant: 'info',
			},
			getFormValues: getFormValues,
			validateForm: validateForm,
			getFormState: getFormState,
		},
		update: {
			windowType: 'form',
			windowTitle: translations['update.title'],
			windowComponent: FormManagePermission,
			windowConfigProps: {
				size: 'xl',
			},
			permission: 'permission.update',
			entriesSelection: 'single',
			operationFunction: (params: PermissionFormValuesType, id: number) =>
				requestUpdate<PermissionModel, PermissionFormValuesType>(
					'permissions',
					params,
					id,
				),
			buttonPosition: 'left',
			button: {
				variant: 'outline',
				hover: 'success',
			},
			getFormValues: getFormValues,
			validateForm: validateForm,
			getFormState: getFormState,
		},
		delete: {
			windowType: 'action',
			windowTitle: translations['delete.title'],
			permission: 'permission.delete',
			entriesSelection: 'single',
			customEntryCheck: (entry: PermissionModel) => !entry.deleted_at, // Return true if the entry is not deleted
			operationFunction: (ids: number[]) =>
				requestDelete('permissions', ids),
			buttonPosition: 'left',
			button: {
				variant: 'outline',
				hover: 'error',
			},
		},
		restore: {
			windowType: 'action',
			windowTitle: translations['restore.title'],
			permission: 'permission.delete',
			entriesSelection: 'single',
			customEntryCheck: (entry: PermissionModel) => !!entry.deleted_at, // Return true if the entry is deleted
			operationFunction: (ids: number[]) =>
				requestRestore('permissions', ids),
			buttonPosition: 'left',
			button: {
				variant: 'outline',
				hover: 'info',
			},
		},
	},
};
