import { z } from 'zod';
import { DataTableValue } from '@/app/(dashboard)/_components/data-table-value';
import {
	type CmrVehicleFormValuesType,
	FormManageCmrVehicle,
} from '@/app/(dashboard)/dashboard/cmr-vehicle/form-manage-cmr-vehicle.component';
import { ViewCmrVehicle } from '@/app/(dashboard)/dashboard/cmr-vehicle/view-cmr-vehicle.component';
import type {
	DataSourceConfigType,
	DataTableColumnType,
} from '@/config/data-source.config';
import { translateBatch } from '@/config/translate.setup';
import {
	getFormDataAsNumber,
	getFormDataAsString,
} from '@/helpers/form.helper';
import { requestFind, requestRestore } from '@/helpers/services.helper';
import { BaseValidator } from '@/helpers/validator.helper';
import { displayCmrLabel } from '@/models/cmr.model';
import {
	type CmrVehicleModel,
	getCmrVehicleDisplayName,
} from '@/models/cmr-vehicle.model';
import { displayVehicleLabel } from '@/models/vehicle.model';
import {
	createCmrVehicle,
	deleteCmrVehicle,
	updateCmrVehicle,
} from '@/services/cmr-vehicle.service';
import type { FindFunctionParamsType } from '@/types/action.type';
import type { FormStateType } from '@/types/form.type';

const translations = await translateBatch(
	[
		'create.title',
		'update.title',
		'delete.title',
		'restore.title',
		'view.title',
	] as const,
	'cmr-vehicle.action',
);

const validatorMessages = await BaseValidator.getValidatorMessages(
	[
		'invalid_cmr_id',
		'invalid_vehicle_id',
		'invalid_vehicle',
		'invalid_vin',
		'invalid_license_plate',
		'invalid_notes',
	] as const,
	'cmr-vehicle.validation',
);

class CmrVehicleValidator extends BaseValidator<typeof validatorMessages> {
	manage = (isSubmit: boolean = true) =>
		z
			.object({
				cmr_id: this.validateId(this.getMessage('invalid_cmr_id')),
				vehicle_id: this.validateId(
					this.getMessage('invalid_vehicle_id'),
					{
						required: false, // Further check is done in superRefine
					},
				),
				vehicle: this.validateString(
					this.getMessage('invalid_vehicle'),
				),
				license_plate: this.validateString(
					this.getMessage('invalid_license_plate'),
					{
						required: true,
						minChars: 8,
					},
				),
				vin: this.validateString(this.getMessage('invalid_vin'), {
					required: false,
					minChars: 17,
					maxChars: 17,
				}),
				notes: this.validateString(this.getMessage('invalid_notes'), {
					required: false,
				}),
			})
			.superRefine((data, ctx) => {
				if (isSubmit && data.vehicle && !data.vehicle_id) {
					ctx.addIssue({
						path: ['vehicle'],
						message: this.getMessage('invalid_vehicle_id'),
						code: 'custom',
					});
				}
			});
}

function validateForm(
	values: CmrVehicleFormValuesType,
	isSubmit: boolean = true,
) {
	const validator = new CmrVehicleValidator(validatorMessages);

	return validator.manage(isSubmit).safeParse(values);
}

function getFormValues(formData: FormData): CmrVehicleFormValuesType {
	return {
		cmr_id: getFormDataAsNumber(formData, 'cmr_id'),
		vehicle_id: getFormDataAsNumber(formData, 'vehicle_id'),
		vehicle: getFormDataAsString(formData, 'vehicle'),
		vin: getFormDataAsString(formData, 'vin'),
		license_plate: getFormDataAsString(formData, 'license_plate'),
		notes: getFormDataAsString(formData, 'notes'),
	};
}

function getFormState(
	data?: CmrVehicleModel,
): FormStateType<CmrVehicleFormValuesType> {
	return {
		errors: {},
		message: null,
		situation: null,
		values: {
			cmr_id: data?.cmr?.id ?? null,
			vehicle_id: data?.vehicle?.id ?? null,
			vehicle: data?.vehicle ? displayVehicleLabel(data.vehicle) : null,
			vin: data?.vin ?? null,
			license_plate: data?.license_plate ?? null,
			notes: data?.notes ?? null,
		},
	};
}

export type CmrVehicleDataTableFiltersType = {
	global: { value: string | null; matchMode: 'contains' };
	cmr_id: { value: string | null; matchMode: 'equals' };
	vehicle: { value: string | null; matchMode: 'equals' };
	vehicle_id: { value: number | null; matchMode: 'equals' };
};

export const dataSourceConfigCmrVehicle: DataSourceConfigType<CmrVehicleModel> =
	{
		dataTable: {
			state: {
				first: 0,
				rows: 10,
				sortField: 'id',
				sortOrder: -1 as const,
				filters: {
					global: { value: '', matchMode: 'contains' },
					cmr_id: { value: '', matchMode: 'equals' },
					vehicle: { value: '', matchMode: 'equals' },
					vehicle_id: { value: null, matchMode: 'equals' },
				} satisfies CmrVehicleDataTableFiltersType,
			},
			columns: [
				{
					field: 'id',
					header: 'ID',
					sortable: true,
					body: (
						entry: CmrVehicleModel,
						column: DataTableColumnType<CmrVehicleModel>,
					) =>
						DataTableValue(entry, column, {
							markDeleted: true,
							displayButton: {
								action: 'view',
								dataSource: 'cmr-vehicle',
							},
						}),
				},
				{
					field: 'cmr',
					header: 'CMR',
					body: (
						entry: CmrVehicleModel,
						column: DataTableColumnType<CmrVehicleModel>,
					) =>
						DataTableValue(entry, column, {
							customValue: displayCmrLabel(entry.cmr),
						}),
				},
				{
					field: 'license_plate',
					header: 'License Plate',
				},
				{
					field: 'created_at',
					header: 'Created At',
					sortable: true,
					body: (
						entry: CmrVehicleModel,
						column: DataTableColumnType<CmrVehicleModel>,
					) =>
						DataTableValue(entry, column, {
							displayDate: true,
						}),
				},
			],
			find: (params: FindFunctionParamsType) =>
				requestFind<CmrVehicleModel>('cmr-vehicle', params),
		},
		displayEntryLabel: (entry: CmrVehicleModel) => {
			return getCmrVehicleDisplayName(entry);
		},
		actions: {
			create: {
				windowType: 'form',
				windowTitle: translations['create.title'],
				windowComponent: FormManageCmrVehicle,
				permission: 'cmr-vehicle.create',
				entriesSelection: 'free',
				operationFunction: (params: CmrVehicleFormValuesType) => {
					const { cmr_id, vehicle, ...prepareParams } = params;

					return createCmrVehicle(prepareParams, cmr_id);
				},
				buttonPosition: 'hidden',
				getFormValues: getFormValues,
				validateForm: validateForm,
				getFormState: getFormState,
			},
			update: {
				windowType: 'form',
				windowTitle: translations['update.title'],
				windowComponent: FormManageCmrVehicle,
				permission: 'cmr-vehicle.update',
				entriesSelection: 'single',
				operationFunction: (
					params: CmrVehicleFormValuesType,
					id: number,
				) => {
					const { cmr_id, vehicle, ...prepareParams } = params;

					return updateCmrVehicle(prepareParams, id, cmr_id);
				},
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
				permission: 'cmr-vehicle.delete',
				entriesSelection: 'single',
				operationFunction: (entry: CmrVehicleModel) => {
					return deleteCmrVehicle(entry);
				},
				buttonPosition: 'left',
				button: {
					variant: 'outline',
					hover: 'error',
				},
			},
			restore: {
				windowType: 'action',
				windowTitle: translations['restore.title'],
				permission: 'cmr-vehicle.delete',
				entriesSelection: 'single',
				customEntryCheck: (entry: CmrVehicleModel) =>
					!!entry.deleted_at, // Return true if the entry is deleted
				operationFunction: (entry: CmrVehicleModel) =>
					requestRestore('cmr-vehicle', entry),
				buttonPosition: 'left',
				button: {
					variant: 'outline',
					hover: 'info',
				},
			},
			view: {
				windowType: 'view',
				windowTitle: translations['view.title'],
				windowComponent: ViewCmrVehicle,
				windowConfigProps: {
					size: 'xl',
				},
				permission: 'cmr-vehicle.read',
				entriesSelection: 'single',
				buttonPosition: 'hidden',
			},
		},
	};
