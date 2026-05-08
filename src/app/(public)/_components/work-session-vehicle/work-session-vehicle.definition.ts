import { z } from 'zod';
import {
	FormManageWorkSessionVehicle,
	type WorkSessionVehicleFormValuesType,
} from '@/app/(public)/_components/work-session-vehicle/form-manage-work-session-vehicle.component';
import type { DataSourceConfigType } from '@/config/data-source.config';
import { translateBatch } from '@/config/translate.setup';
import {
	getFormDataAsNumber,
	getFormDataAsString,
} from '@/helpers/form.helper';
import { BaseValidator } from '@/helpers/validator.helper';
import { getCompanyVehicleDisplayName } from '@/models/company-vehicle.model';
import {
	getWorkSessionVehicleDisplayName,
	type WorkSessionVehicleModel,
	WorkSessionVehicleStatusEnum,
} from '@/models/work-session-vehicle.model';
import {
	deleteWorkSessionVehicle,
	updateStatusWorkSessionVehicle,
} from '@/services/work-session-vehicle.service';
import type { FormStateType } from '@/types/form.type';

const translations = await translateBatch(
	['create.title', 'update.title', 'delete.title', 'return.title'] as const,
	'work-session-vehicle.action',
);

const validatorMessages = await BaseValidator.getValidatorMessages(
	[
		'invalid_company_vehicle_id',
		'invalid_company_vehicle',
		'invalid_vehicle_km_start',
		'invalid_vehicle_km_end',
		'invalid_notes',
	] as const,
	'work-session-vehicle.validation',
);

class WorkSessionVehicleValidator extends BaseValidator<
	typeof validatorMessages
> {
	manage = (isSubmit: boolean = true) =>
		z
			.object({
				company_vehicle_id: this.validateId(
					this.getMessage('invalid_company_vehicle_id'),
					{
						required: false, // Further check is done in superRefine
					},
				),
				company_vehicle: this.validateString(
					this.getMessage('invalid_company_vehicle'),
				),
				vehicle_km_start: this.validateNumber(
					this.getMessage('invalid_vehicle_km_start'),
					{
						required: false,
					},
				),
				vehicle_km_end: this.validateNumber(
					this.getMessage('invalid_vehicle_km_end'),
					{
						required: false,
					},
				),
				notes: this.validateString(this.getMessage('invalid_notes'), {
					required: false,
				}),
			})
			.superRefine((data, ctx) => {
				if (
					isSubmit &&
					data.company_vehicle &&
					!data.company_vehicle_id
				) {
					ctx.addIssue({
						path: ['brand'],
						message: this.getMessage('invalid_company_vehicle_id'),
						code: 'custom',
					});
				}
			});
}

function validateForm(
	values: WorkSessionVehicleFormValuesType,
	isSubmit: boolean = true,
) {
	const validator = new WorkSessionVehicleValidator(validatorMessages);

	return validator.manage(isSubmit).safeParse(values);
}

function getFormValues(formData: FormData): WorkSessionVehicleFormValuesType {
	return {
		company_vehicle_id: getFormDataAsNumber(formData, 'company_vehicle_id'),
		company_vehicle: getFormDataAsString(formData, 'company_vehicle'),
		vehicle_km_start: getFormDataAsNumber(formData, 'vehicle_km_start'),
		vehicle_km_end: getFormDataAsNumber(formData, 'vehicle_km_end'),
		notes: getFormDataAsString(formData, 'notes'),
	};
}

function getFormState(
	data?: WorkSessionVehicleModel,
): FormStateType<WorkSessionVehicleFormValuesType> {
	return {
		errors: {},
		message: null,
		situation: null,
		values: {
			company_vehicle_id: data?.company_vehicle?.id ?? null,
			company_vehicle: data?.company_vehicle
				? getCompanyVehicleDisplayName(data.company_vehicle)
				: null,
			vehicle_km_start: data?.vehicle_km_start ?? null,
			vehicle_km_end: data?.vehicle_km_end ?? null,
			notes: data?.notes ?? null,
		},
	};
}

export const dataSourceConfigWorkSessionVehicle: Omit<
	DataSourceConfigType<
		WorkSessionVehicleModel,
		WorkSessionVehicleFormValuesType
	>,
	'dataTable'
> = {
	displayEntryLabel: (entry: WorkSessionVehicleModel) => {
		return getWorkSessionVehicleDisplayName(entry);
	},
	actions: {
		create: {
			windowType: 'form',
			windowTitle: translations['create.title'],
			windowComponent: FormManageWorkSessionVehicle,
			permission: 'work-session-vehicle.create',
			entriesSelection: 'free',
			operationFunction: () => {
				// It is overridden in the component
				throw new Error('Not defined here');
			},
			buttonPosition: 'hidden',
			getFormValues: getFormValues,
			validateForm: validateForm,
			getFormState: getFormState,
		},
		update: {
			windowType: 'form',
			windowTitle: translations['update.title'],
			windowComponent: FormManageWorkSessionVehicle,
			permission: 'work-session-vehicle.update',
			entriesSelection: 'single',
			operationFunction: () => {
				// It is overridden in the component
				throw new Error('Not defined here');
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
			permission: 'work-session-vehicle.delete',
			entriesSelection: 'single',
			operationFunction: (entry: WorkSessionVehicleModel) => {
				return deleteWorkSessionVehicle(entry);
			},
			buttonPosition: 'left',
			button: {
				variant: 'outline',
				hover: 'error',
			},
		},
		return: {
			windowType: 'action',
			windowTitle: translations['return.title'],
			permission: 'work-session-vehicle.update',
			entriesSelection: 'single',
			customEntryCheck: (entry: WorkSessionVehicleModel) =>
				entry.status === WorkSessionVehicleStatusEnum.ASSIGNED,
			operationFunction: (entry: WorkSessionVehicleModel) =>
				updateStatusWorkSessionVehicle(entry, 'returned'),
			buttonPosition: 'left',
			button: {
				variant: 'outline',
				hover: 'info',
			},
		},
	},
};
