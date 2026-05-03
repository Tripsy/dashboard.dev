import { z } from 'zod';
import { DataTableValue } from '@/app/(dashboard)/_components/data-table-value';
import { FormManageWorkSessionVehicle } from '@/app/(dashboard)/dashboard/work-session-vehicles/form-manage-work-session-vehicle.component';
import { ViewWorkSessionVehicle } from '@/app/(dashboard)/dashboard/work-session-vehicles/view-work-session-vehicle.component';
import type {
	DataSourceConfigType,
	DataTableColumnType,
} from '@/config/data-source.config';
import { translateBatch } from '@/config/translate.setup';
import {
	getFormDataAsNumber,
	getFormDataAsString,
} from '@/helpers/form.helper';
import { requestFind, requestUpdateStatus } from '@/helpers/services.helper';
import { formatEnumLabel } from '@/helpers/string.helper';
import { BaseValidator } from '@/helpers/validator.helper';
import { getCompanyVehicleDisplayName } from '@/models/company-vehicle.model';
import {
	getWorkSessionDisplayName,
	type WorkSessionStatus,
} from '@/models/work-session.model';
import {
	getWorkSessionVehicleDisplayName,
	type WorkSessionVehicleFormValuesType,
	type WorkSessionVehicleModel,
	type WorkSessionVehicleStatus,
	WorkSessionVehicleStatusEnum,
} from '@/models/work-session-vehicle.model';
import {
	createWorkSessionVehicle,
	deleteWorkSessionVehicle, updateStatusWorkSessionVehicle,
	updateWorkSessionVehicle,
} from '@/services/work-session-vehicles.service';
import type { FindFunctionParamsType } from '@/types/action.type';
import type { FormStateType } from '@/types/form.type';

const translations = await translateBatch(
	[
		'create.title',
		'update.title',
		'delete.title',
		'view.title',
		'return.title',
	] as const,
	'work-session-vehicles.action',
);

const validatorMessages = await BaseValidator.getValidatorMessages(
	[
		'invalid_work_session_id',
		'invalid_company_vehicle_id',
		'invalid_company_vehicle',
		'invalid_vehicle_km_start',
		'invalid_vehicle_km_end',
		'invalid_notes',
	] as const,
	'work-session-vehicles.validation',
);

class WorkSessionVehicleValidator extends BaseValidator<
	typeof validatorMessages
> {
	manage = (isSubmit: boolean = true) =>
		z
			.object({
				work_session_id: this.validateId(
					this.getMessage('invalid_work_session_id'),
				),
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
		work_session_id: getFormDataAsNumber(formData, 'work_session_id'),
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
			work_session_id: data?.work_session?.id ?? null,
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

export type WorkSessionVehiclesDataTableFiltersType = {
	company_vehicle: { value: string | null; matchMode: 'equals' };
	company_vehicle_id: { value: number | null; matchMode: 'equals' };
	work_session_status: {
		value: WorkSessionStatus | null;
		matchMode: 'equals';
	};
	status: { value: WorkSessionVehicleStatus | null; matchMode: 'equals' };
};

export const dataSourceConfigWorkSessionVehicles: DataSourceConfigType<
	WorkSessionVehicleModel,
	WorkSessionVehicleFormValuesType
> = {
	dataTable: {
		state: {
			first: 0,
			rows: 10,
			sortField: 'id',
			sortOrder: -1 as const,
			filters: {
				company_vehicle: { value: '', matchMode: 'equals' },
				company_vehicle_id: { value: null, matchMode: 'equals' },
				work_session_status: { value: null, matchMode: 'equals' },
				status: { value: null, matchMode: 'equals' },
			} satisfies WorkSessionVehiclesDataTableFiltersType,
		},
		columns: [
			{
				field: 'id',
				header: 'ID',
				sortable: true,
				body: (
					entry: WorkSessionVehicleModel,
					column: DataTableColumnType<WorkSessionVehicleModel>,
				) =>
					DataTableValue(entry, column, {
						markDeleted: true,
						displayButton: {
							action: 'view',
							dataSource: 'work-session-vehicles',
						},
					}),
			},
			{
				field: 'work_session',
				header: 'Session ID',
				body: (
					entry: WorkSessionVehicleModel,
					column: DataTableColumnType<WorkSessionVehicleModel>,
				) =>
					DataTableValue(entry, column, {
						customValue: entry.work_session.id.toString(),
					}),
			},
			{
				field: 'work_session',
				header: 'Session',
				body: (
					entry: WorkSessionVehicleModel,
					column: DataTableColumnType<WorkSessionVehicleModel>,
				) =>
					DataTableValue(entry, column, {
						customValue: getWorkSessionDisplayName(
							entry.work_session,
						),
					}),
			},
			{
				field: 'work_session',
				header: 'Session Status',
				body: (entry, column) =>
					DataTableValue(entry, column, {
						isStatus: true,
						customValue: formatEnumLabel(entry.work_session.status),
					}),
				style: { minWidth: '8rem', maxWidth: '8rem' },
			},
			{
				field: 'company_vehicle',
				header: 'Vehicle',
				body: (
					entry: WorkSessionVehicleModel,
					column: DataTableColumnType<WorkSessionVehicleModel>,
				) =>
					DataTableValue(entry, column, {
						customValue: getCompanyVehicleDisplayName(
							entry.company_vehicle,
						),
					}),
			},
			{
				field: 'status',
				header: 'Status',
				body: (
					entry: WorkSessionVehicleModel,
					column: DataTableColumnType<WorkSessionVehicleModel>,
				) =>
					DataTableValue(entry, column, {
						isStatus: true,
						markDeleted: true,
						displayButton: {
							action: (entry: WorkSessionVehicleModel) => {
								return entry.status ===
									WorkSessionVehicleStatusEnum.ASSIGNED
									? 'return'
									: undefined;
							},
							dataSource: 'work-session-vehicles',
						},
					}),
				style: {
					minWidth: '8rem',
					maxWidth: '8rem',
				},
			},
			{
				field: 'assigned_at',
				header: 'Assigned At',
				sortable: true,
				body: (
					entry: WorkSessionVehicleModel,
					column: DataTableColumnType<WorkSessionVehicleModel>,
				) =>
					DataTableValue(entry, column, {
						displayDate: true,
					}),
			},
			{
				field: 'returned_at',
				header: 'Returned At',
				sortable: true,
				body: (
					entry: WorkSessionVehicleModel,
					column: DataTableColumnType<WorkSessionVehicleModel>,
				) =>
					DataTableValue(entry, column, {
						displayDate: true,
					}),
			},
		],
		find: (params: FindFunctionParamsType) =>
			requestFind<WorkSessionVehicleModel>(
				'work-session-vehicles',
				params,
			),
	},
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
			operationFunction: (params: WorkSessionVehicleFormValuesType) => {
				const { work_session_id, company_vehicle, ...prepareParams } =
					params;

				return createWorkSessionVehicle(prepareParams, work_session_id);
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
			operationFunction: (
				params: WorkSessionVehicleFormValuesType,
				id: number,
			) => {
				const { work_session_id, company_vehicle, ...prepareParams } =
					params;

				return updateWorkSessionVehicle(
					prepareParams,
					id,
					work_session_id,
				);
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
		view: {
			windowType: 'view',
			windowTitle: translations['view.title'],
			windowComponent: ViewWorkSessionVehicle,
			windowConfigProps: {
				size: 'xl',
			},
			permission: 'work-session-vehicle.read',
			entriesSelection: 'single',
			buttonPosition: 'hidden',
		},
	},
};
