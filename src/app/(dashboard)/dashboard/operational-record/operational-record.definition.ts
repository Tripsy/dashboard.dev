import { z } from 'zod';
import { DataTableValue } from '@/app/(dashboard)/_components/data-table-value';
import {
	FormManageOperationalRecord,
	type OperationalRecordFormValuesType,
} from '@/app/(dashboard)/dashboard/operational-record/form-manage-operational-record.component';
import { ViewOperationalRecord } from '@/app/(dashboard)/dashboard/operational-record/view-operational-record.component';
import type {
	DataSourceConfigType,
	DataTableValueOptionsType,
} from '@/config/data-source.config';
import { translateBatch } from '@/config/translate.setup';
import {
	getFormDataAsNumber,
	getFormDataAsString,
} from '@/helpers/form.helper';
import {
	requestCreate,
	requestDelete,
	requestFind,
	requestRestore,
	requestUpdate,
} from '@/helpers/services.helper';
import { BaseValidator } from '@/helpers/validator.helper';
import type { CashFlowModel, CashFlowStatus } from '@/models/cash-flow.model';
import { displayClientLabel } from '@/models/client.model';
import { displayCmrLabel } from '@/models/cmr.model';
import { displayCompanyVehicleLabel } from '@/models/company-vehicle.model';
import {
	displayOperationalRecordLabel,
	type OperationalRecordModel,
} from '@/models/operational-record.model';
import type { FindFunctionParamsType } from '@/types/action.type';
import type { FormStateType } from '@/types/form.type';

const translations = await translateBatch(
	[
		'create.title',
		'update.title',
		'delete.title',
		'restore.title',
		'view.title',
		'viewCashFlow.title',
		'viewClient.title',
		'viewUser.title',
		'viewCompanyVehicle.title',
		'viewCmr.title',
	] as const,
	'operational-record.action',
);

const validatorMessages = await BaseValidator.getValidatorMessages(
	[
		'invalid_cash_flow_id',
		'invalid_client_id',
		'invalid_client',
		'invalid_user_id',
		'invalid_user',
		'invalid_company_vehicle_id',
		'invalid_company_vehicle',
		'invalid_cmr_id',
		'invalid_cmr',
		'invalid_notes',
	] as const,
	'operational-record.validation',
);

class OperationalRecordValidator extends BaseValidator<
	typeof validatorMessages
> {
	manage = (isSubmit: boolean = true) =>
		z
			.object({
				cash_flow_id: this.validateId(
					this.getMessage('invalid_cash_flow_id'),
				),
				client_id: this.validateId(
					this.getMessage('invalid_client_id'),
					{
						required: false, // Further check is done in superRefine
					},
				),
				client: this.validateString(this.getMessage('invalid_client')),
				user_id: this.validateId(this.getMessage('invalid_user_id'), {
					required: false, // Further check is done in superRefine
				}),
				user: this.validateString(this.getMessage('invalid_user')),
				company_vehicle_id: this.validateId(
					this.getMessage('invalid_company_vehicle_id'),
					{
						required: false, // Further check is done in superRefine
					},
				),
				company_vehicle: this.validateString(
					this.getMessage('invalid_company_vehicle'),
				),
				cmr_id: this.validateId(this.getMessage('invalid_cmr_id'), {
					required: false, // Further check is done in superRefine
				}),
				cmr: this.validateString(this.getMessage('invalid_cmr')),
				notes: this.validateString(this.getMessage('invalid_notes'), {
					required: false,
				}),
			})
			.superRefine((data, ctx) => {
				if (isSubmit && data.client && !data.client_id) {
					ctx.addIssue({
						path: ['client'],
						message: this.getMessage('invalid_client_id'),
						code: 'custom',
					});
				}

				if (isSubmit && data.user && !data.user_id) {
					ctx.addIssue({
						path: ['user'],
						message: this.getMessage('invalid_user_id'),
						code: 'custom',
					});
				}

				if (
					isSubmit &&
					data.company_vehicle &&
					!data.company_vehicle_id
				) {
					ctx.addIssue({
						path: ['company_vehicle'],
						message: this.getMessage('invalid_company_vehicle_id'),
						code: 'custom',
					});
				}

				if (isSubmit && data.cmr && !data.cmr_id) {
					ctx.addIssue({
						path: ['cmr'],
						message: this.getMessage('invalid_cmr_id'),
						code: 'custom',
					});
				}
			});
}

function validateForm(
	values: OperationalRecordFormValuesType,
	isSubmit: boolean = true,
) {
	const validator = new OperationalRecordValidator(validatorMessages);

	return validator.manage(isSubmit).safeParse(values);
}

function getFormValues(formData: FormData): OperationalRecordFormValuesType {
	return {
		cash_flow_id: getFormDataAsNumber(formData, 'cash_flow_id'),
		client_id: getFormDataAsNumber(formData, 'client_id'),
		client: getFormDataAsString(formData, 'client'),
		user_id: getFormDataAsNumber(formData, 'user_id'),
		user: getFormDataAsString(formData, 'user'),
		company_vehicle_id: getFormDataAsNumber(formData, 'company_vehicle_id'),
		company_vehicle: getFormDataAsString(formData, 'company_vehicle'),
		cmr_id: getFormDataAsNumber(formData, 'cmr_id'),
		cmr: getFormDataAsString(formData, 'cmr'),
		notes: getFormDataAsString(formData, 'notes'),
	};
}

function getFormState(
	data?: OperationalRecordModel,
): FormStateType<OperationalRecordFormValuesType> {
	return {
		errors: {},
		message: null,
		situation: null,
		values: {
			cash_flow_id: data?.cash_flow?.id ?? null,
			client_id: data?.client?.id ?? null,
			client: data?.client ? displayClientLabel(data.client) : null,
			user_id: data?.user?.id ?? null,
			user: data?.user ? data.user.name : null,
			company_vehicle_id: data?.company_vehicle?.id ?? null,
			company_vehicle: data?.company_vehicle
				? displayCompanyVehicleLabel(data.company_vehicle)
				: null,
			cmr_id: data?.cmr?.id ?? null,
			cmr: data?.cmr ? displayCmrLabel(data.cmr) : null,
			notes: data?.notes ?? null,
		},
	};
}

export type OperationalRecordDataTableFiltersType = {
	cash_flow_id: { value: number | null; matchMode: 'equals' };
	cash_flow_status: { value: CashFlowStatus | null; matchMode: 'equals' };
	client: { value: string | null; matchMode: 'equals' };
	client_id: { value: number | null; matchMode: 'equals' };
	user: { value: string | null; matchMode: 'equals' };
	user_id: { value: number | null; matchMode: 'equals' };
	company_vehicle: { value: string | null; matchMode: 'equals' };
	company_vehicle_id: { value: number | null; matchMode: 'equals' };
	cmr: { value: string | null; matchMode: 'equals' };
	cmr_id: { value: number | null; matchMode: 'equals' };
	recorded_at_start: { value: string | null; matchMode: 'equals' };
	recorded_at_end: { value: string | null; matchMode: 'equals' };
	is_deleted: { value: boolean; matchMode: 'equals' };
};

function displayButtonViewCashFlow(
	entry: OperationalRecordModel,
): DataTableValueOptionsType<OperationalRecordModel>['displayButton'] {
	return {
		action: 'view',
		dataSource: 'cash-flow',
		altTitle: translations['viewCashFlow.title'],
		alternateEntryId: entry?.cash_flow?.id,
	};
}

function displayButtonViewClient(
	entry: OperationalRecordModel,
): DataTableValueOptionsType<OperationalRecordModel>['displayButton'] {
	return {
		action: 'view',
		dataSource: 'client',
		altTitle: translations['viewClient.title'],
		alternateEntryId: entry?.client?.id,
	};
}

function displayButtonViewUser(
	entry: OperationalRecordModel,
): DataTableValueOptionsType<OperationalRecordModel>['displayButton'] {
	return {
		action: 'view',
		dataSource: 'user',
		altTitle: translations['viewUser.title'],
		alternateEntryId: entry?.user?.id,
	};
}

function displayButtonViewCompanyVehicle(
	entry: OperationalRecordModel,
): DataTableValueOptionsType<OperationalRecordModel>['displayButton'] {
	return {
		action: 'view',
		dataSource: 'company-vehicle',
		altTitle: translations['viewCompanyVehicle.title'],
		alternateEntryId: entry?.company_vehicle?.id,
	};
}

export const dataSourceConfigOperationalRecord: DataSourceConfigType<OperationalRecordModel> =
	{
		dataTable: {
			state: {
				first: 0,
				rows: 10,
				sortField: 'id',
				sortOrder: -1 as const,
				filters: {
					cash_flow_id: { value: null, matchMode: 'equals' },
					cash_flow_status: { value: null, matchMode: 'equals' },
					client: { value: '', matchMode: 'equals' },
					client_id: { value: null, matchMode: 'equals' },
					user: { value: '', matchMode: 'equals' },
					user_id: { value: null, matchMode: 'equals' },
					company_vehicle: { value: '', matchMode: 'equals' },
					company_vehicle_id: { value: null, matchMode: 'equals' },
					cmr: { value: '', matchMode: 'equals' },
					cmr_id: { value: null, matchMode: 'equals' },
					recorded_at_start: { value: null, matchMode: 'equals' },
					recorded_at_end: { value: null, matchMode: 'equals' },
					is_deleted: { value: false, matchMode: 'equals' },
				} satisfies OperationalRecordDataTableFiltersType,
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
								dataSource: 'operational-record',
							},
						}),
				},
				{
					field: 'cash_flow_id',
					header: 'Cash Flow',
					body: (entry, column) =>
						DataTableValue(entry, column, {
							customValue: entry.cash_flow.id.toString(),
							displayButton: displayButtonViewCashFlow(entry),
						}),
				},
				{
					field: 'cash_flow_status',
					header: 'Cash Flow Status',
					body: (entry) =>
						DataTableValue<CashFlowModel>(
							entry.cash_flow,
							'status',
							{
								isStatus: true,
								dataSourceKey: 'cash-flow',
							},
						),
					style: { minWidth: '8rem', maxWidth: '8rem' },
				},
				{
					field: 'client',
					header: 'Client',
					body: (entry, column) =>
						DataTableValue(entry, column, {
							customValue: entry.client
								? displayClientLabel(entry.client)
								: '-',
							displayButton: entry.client
								? displayButtonViewClient(entry)
								: undefined,
						}),
				},
				{
					field: 'user',
					header: 'User',
					body: (entry, column) =>
						DataTableValue(entry, column, {
							customValue: entry.user ? entry.user.name : '-',
							displayButton: entry.user
								? displayButtonViewUser(entry)
								: undefined,
						}),
				},
				{
					field: 'company_vehicle',
					header: 'Vehicle',
					body: (entry, column) =>
						DataTableValue(entry, column, {
							customValue: entry.company_vehicle
								? displayCompanyVehicleLabel(
										entry.company_vehicle,
									)
								: '-',
							displayButton: entry.company_vehicle
								? displayButtonViewCompanyVehicle(entry)
								: undefined,
						}),
				},
				{
					field: 'recorded_at',
					header: 'Recorded At',
					sortable: true,
					body: (entry, column) =>
						DataTableValue(entry, column, {
							displayDate: true,
						}),
				},
			],
			find: (params: FindFunctionParamsType) =>
				requestFind<OperationalRecordModel>(
					'operational-record',
					params,
				),
		},
		displayEntryLabel: (entry: OperationalRecordModel) => {
			return displayOperationalRecordLabel(entry);
		},
		actions: {
			create: {
				windowType: 'form',
				windowTitle: translations['create.title'],
				windowComponent: FormManageOperationalRecord,
				permission: 'operational-record.create',
				entriesSelection: 'free',
				operationFunction: (
					params: OperationalRecordFormValuesType,
				) => {
					const {
						client,
						user,
						company_vehicle,
						cmr,
						...prepareParams
					} = params;

					return requestCreate<
						OperationalRecordModel,
						Partial<OperationalRecordFormValuesType>
					>('operational-record', prepareParams);
				},
				buttonPosition: 'hidden',
				getFormValues: getFormValues,
				validateForm: validateForm,
				getFormState: getFormState,
			},
			update: {
				windowType: 'form',
				windowTitle: translations['update.title'],
				windowComponent: FormManageOperationalRecord,
				permission: 'operational-record.update',
				entriesSelection: 'single',
				operationFunction: (
					params: OperationalRecordFormValuesType,
					id: number,
				) => {
					const {
						client,
						user,
						company_vehicle,
						cmr,
						...prepareParams
					} = params;

					return requestUpdate<
						OperationalRecordModel,
						Partial<OperationalRecordFormValuesType>
					>('operational-record', prepareParams, id);
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
				permission: 'operational-record.delete',
				entriesSelection: 'single',
				operationFunction: (entry: OperationalRecordModel) =>
					requestDelete('operational-record', entry),
				buttonPosition: 'left',
				button: {
					variant: 'outline',
					hover: 'error',
				},
			},
			restore: {
				windowType: 'action',
				windowTitle: translations['restore.title'],
				permission: 'operational-record.delete',
				entriesSelection: 'single',
				operationFunction: (entry: OperationalRecordModel) =>
					requestRestore('operational-record', entry),
				buttonPosition: 'left',
				button: {
					variant: 'outline',
					hover: 'error',
				},
			},
			view: {
				windowType: 'view',
				windowTitle: translations['view.title'],
				windowComponent: ViewOperationalRecord,
				windowConfigProps: {
					size: 'xl',
				},
				permission: 'operational-record.read',
				entriesSelection: 'single',
				buttonPosition: 'hidden',
			},
		},
	};
