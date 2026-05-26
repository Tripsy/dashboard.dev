import { z } from 'zod';
import { DataTableValue } from '@/app/(dashboard)/_components/data-table-value';
import {
	FormManageVendor,
	type VendorFormValuesType,
} from '@/app/(dashboard)/dashboard/vendor/form-manage-vendor.component';
import { ViewVendor } from '@/app/(dashboard)/dashboard/vendor/view-vendor.component';
import { translateBatch } from '@/config/translate.setup';
import { getFormDataAsString } from '@/helpers/form.helper';
import { arrayHasValue } from '@/helpers/objects.helper';
import {
	requestCreate,
	requestDelete,
	requestFind,
	requestRestore,
	requestUpdate,
	requestUpdateStatus,
} from '@/helpers/services.helper';
import { BaseValidator } from '@/helpers/validator.helper';
import {
	displayVendorLabel,
	type VendorModel,
	type VendorStatus,
	VendorStatusEnum,
} from '@/models/vendor.model';
import type { FindFunctionParamsType } from '@/types/action.type';
import type { DataSourceConfigType } from '@/types/data-source.type';
import type { FormStateType } from '@/types/form.type';

const translations = await translateBatch(
	[
		'create.title',
		'update.title',
		'view.title',
		'delete.title',
		'restore.title',
		'enable.title',
		'disable.title',
	] as const,
	'vendor.action',
);

const validatorMessages = await BaseValidator.getValidatorMessages(
	['invalid_name'] as const,
	'vendor.validation',
);

class VendorValidator extends BaseValidator<typeof validatorMessages> {
	manage = () =>
		z.object({
			name: this.validateString(this.getMessage('invalid_name')),
		});
}

function validateForm(values: VendorFormValuesType) {
	const validator = new VendorValidator(validatorMessages);

	return validator.manage().safeParse(values);
}

function getFormValues(formData: FormData): VendorFormValuesType {
	return {
		name: getFormDataAsString(formData, 'name'),
	};
}

function getFormState(data?: VendorModel): FormStateType<VendorFormValuesType> {
	return {
		errors: {},
		message: null,
		situation: null,
		values: {
			name: data?.name ?? null,
		},
	};
}

export type VendorDataTableFiltersType = {
	global: { value: string | null; matchMode: 'contains' };
	status: { value: VendorStatus | null; matchMode: 'equals' };
	is_deleted: { value: boolean; matchMode: 'equals' };
};

export const dataSourceConfigVendor: DataSourceConfigType<VendorModel> = {
	dataTable: {
		state: {
			first: 0,
			rows: 10,
			sortField: 'id',
			sortOrder: -1 as const,
			filters: {
				global: { value: null, matchMode: 'contains' },
				status: { value: null, matchMode: 'equals' },
				is_deleted: { value: false, matchMode: 'equals' },
			} satisfies VendorDataTableFiltersType,
		},
		columns: [
			{
				field: 'id',
				header: 'ID',
				sortable: true,
				body: (entry, column) =>
					DataTableValue(entry, column, {
						markDeleted: true,
						displayButton: {
							action: 'view',
							dataSource: 'vendor',
						},
					}),
			},
			{
				field: 'name',
				header: 'Name',
				sortable: true,
			},
			{
				field: 'status',
				header: 'Status',
				body: (entry, column) =>
					DataTableValue(entry, column, {
						isStatus: true,
						dataSourceKey: 'vendor',
						markDeleted: true,
						displayButton: {
							action: (entry: VendorModel) => {
								return entry.deleted_at
									? 'restore'
									: entry.status === VendorStatusEnum.ACTIVE
										? 'disable'
										: 'enable';
							},
							dataSource: 'vendor',
						},
					}),
				style: {
					minWidth: '8rem',
					maxWidth: '8rem',
				},
			},
			{
				field: 'created_at',
				header: 'Created At',
				sortable: true,
				body: (entry, column) =>
					DataTableValue(entry, column, {
						displayDate: true,
					}),
			},
		],
		find: (params: FindFunctionParamsType) =>
			requestFind<VendorModel>('vendor', params),
	},
	displayEntryLabel: (entry: VendorModel) => displayVendorLabel(entry),
	actions: {
		create: {
			windowType: 'form',
			windowTitle: translations['create.title'],
			windowComponent: FormManageVendor,
			permission: ['vendor', 'create'],
			entriesSelection: 'free',
			operationFunction: (params: VendorFormValuesType) =>
				requestCreate<VendorModel, VendorFormValuesType>(
					'vendor',
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
			windowComponent: FormManageVendor,
			permission: ['vendor', 'update'],
			entriesSelection: 'single',
			operationFunction: (params: VendorFormValuesType, id: number) =>
				requestUpdate<VendorModel, VendorFormValuesType>(
					'vendor',
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
			permission: ['vendor', 'delete'],
			entriesSelection: 'single',
			customEntryCheck: (entry: VendorModel) => !entry.deleted_at, // Return true if the entry is not deleted
			operationFunction: (entry: VendorModel) =>
				requestDelete('vendor', entry),
			buttonPosition: 'left',
			button: {
				variant: 'outline',
				hover: 'error',
			},
		},
		restore: {
			windowType: 'action',
			windowTitle: translations['restore.title'],
			permission: ['vendor', 'delete'],
			entriesSelection: 'single',
			customEntryCheck: (entry: VendorModel) => !!entry.deleted_at, // Return true if the entry is deleted
			operationFunction: (entry: VendorModel) =>
				requestRestore('vendor', entry),
			buttonPosition: 'left',
			button: {
				variant: 'outline',
				hover: 'info',
			},
		},
		enable: {
			windowType: 'action',
			windowTitle: translations['enable.title'],
			permission: ['vendor', 'update'],
			entriesSelection: 'single',
			customEntryCheck: (entry: VendorModel) =>
				!entry.deleted_at &&
				arrayHasValue(entry.status, [
					VendorStatusEnum.PENDING,
					VendorStatusEnum.INACTIVE,
				]),
			operationFunction: (entry: VendorModel) =>
				requestUpdateStatus('vendor', entry, 'active'),
			buttonPosition: 'left',
			button: {
				variant: 'outline',
				hover: 'info',
			},
		},
		disable: {
			windowType: 'action',
			windowTitle: translations['disable.title'],
			permission: ['vendor', 'update'],
			entriesSelection: 'single',
			customEntryCheck: (entry: VendorModel) =>
				!entry.deleted_at &&
				arrayHasValue(entry.status, [
					VendorStatusEnum.PENDING,
					VendorStatusEnum.ACTIVE,
				]),
			operationFunction: (entry: VendorModel) =>
				requestUpdateStatus('vendor', entry, 'inactive'),
			buttonPosition: 'left',
			button: {
				variant: 'outline',
				hover: 'error',
			},
		},
		view: {
			windowType: 'view',
			windowTitle: translations['view.title'],
			windowComponent: ViewVendor,
			windowConfigProps: {
				size: 'xl',
			},
			permission: ['vendor', 'read'],
			entriesSelection: 'single',
			buttonPosition: 'hidden',
		},
	},
};
