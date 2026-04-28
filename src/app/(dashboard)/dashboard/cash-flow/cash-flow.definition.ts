import { z } from 'zod';
import { DataTableValue } from '@/app/(dashboard)/_components/data-table-value';
import { FormManageCashFlow } from '@/app/(dashboard)/dashboard/cash-flow/form-manage-cash-flow.component';
import { ViewCashFlow } from '@/app/(dashboard)/dashboard/cash-flow/view-cash-flow.component';
import type {
	DataSourceConfigType,
	DataTableColumnType,
} from '@/config/data-source.config';
import { Configuration } from '@/config/settings.config';
import { translateBatch } from '@/config/translate.setup';
import { DisplayAmount } from '@/helpers/display.helper';
import {
	getFormDataAsEnum,
	getFormDataAsNumber,
	getFormDataAsString,
} from '@/helpers/form.helper';
import { arrayHasValue } from '@/helpers/objects.helper';
import {
	requestCreate,
	requestDelete,
	requestFind,
	requestUpdate,
	requestUpdateStatus,
} from '@/helpers/services.helper';
import { formatAmount, formatEnumLabel } from '@/helpers/string.helper';
import { BaseValidator } from '@/helpers/validator.helper';
import {
	type CashFlowCategory,
	CashFlowCategoryEnum,
	type CashFlowDirection,
	CashFlowDirectionEnum,
	type CashFlowFormValuesType,
	type CashFlowMethod,
	CashFlowMethodEnum,
	type CashFlowModel,
	type CashFlowParamsType,
	type CashFlowStatus,
	CashFlowStatusEnum,
	getExpectedCategoryType,
	getExpectedDirection,
	getStatusTransitions,
	MUTABLE_STATUSES,
	REFUNDABLE_STATUSES,
} from '@/models/cash-flow.model';
import type { FindFunctionParamsType } from '@/types/action.type';
import { type Currency, CurrencyEnum } from '@/types/common.type';
import type { FormStateType } from '@/types/form.type';

const translations = await translateBatch(
	[
		'create.title',
		'refund.title',
		'update.title',
		'view.title',
		'delete.title',
		'complete.title',
		'drop.title',
	] as const,
	'cash-flow.action',
);

const validatorMessages = await BaseValidator.getValidatorMessages(
	[
		'invalid_category',
		'invalid_method',
		'invalid_amount',
		'invalid_vat_rate',
		'invalid_currency',
		'invalid_external_reference',
		'invalid_parent_id',
		'invalid_notes',
	] as const,
	'cash-flow.validation',
);

class CashFlowValidator extends BaseValidator<typeof validatorMessages> {
	manage = z.object({
		category: this.validateEnum(
			CashFlowCategoryEnum,
			this.getMessage('invalid_category'),
		),
		method: this.validateEnum(
			CashFlowMethodEnum,
			this.getMessage('invalid_method'),
		),
		amount: this.validateNumber(this.getMessage('invalid_amount'), {
			required: true,
			onlyPositive: false,
			allowDecimals: 2,
		}),
		vat_rate: this.validateNumber(this.getMessage('invalid_vat_rate'), {
			required: true,
			onlyPositive: true,
			allowDecimals: 2,
		}),
		currency: this.validateEnum(
			CurrencyEnum,
			this.getMessage('invalid_currency'),
		),
		external_reference: this.validateString(
			this.getMessage('invalid_external_reference'),
			{ required: false },
		),
		parent_id: this.validateId(this.getMessage('invalid_parent_id'), {
			required: false,
		}),
		notes: this.validateString(this.getMessage('invalid_notes'), {
			required: false,
		}),
	});
}

function validateForm(values: CashFlowFormValuesType) {
	const validator = new CashFlowValidator(validatorMessages);

	return validator.manage.safeParse(values);
}

function getFormValues(formData: FormData): CashFlowFormValuesType {
	return {
		category:
			getFormDataAsEnum(formData, 'category', CashFlowCategoryEnum) ||
			CashFlowCategoryEnum.CUSTOMER,
		method:
			getFormDataAsEnum(formData, 'method', CashFlowMethodEnum) ||
			CashFlowMethodEnum.CASH,
		amount: getFormDataAsNumber(formData, 'amount'),
		vat_rate: getFormDataAsNumber(formData, 'vat_rate') || 0,
		currency:
			getFormDataAsEnum(formData, 'currency', CurrencyEnum) ||
			Configuration.currency(),
		external_reference: getFormDataAsString(formData, 'external_reference'),
		parent_id: getFormDataAsNumber(formData, 'parent_id'),
		notes: getFormDataAsString(formData, 'notes'),
	};
}

function getFormState(
	data?: CashFlowModel,
): FormStateType<CashFlowFormValuesType> {
	return {
		errors: {},
		message: null,
		situation: null,
		values: {
			category: data?.category ?? CashFlowCategoryEnum.CUSTOMER,
			method: data?.method ?? CashFlowMethodEnum.CASH,
			amount: data?.amount ?? null,
			vat_rate:
				data?.vat_rate ?? (Configuration.get('app.vat_rate') as number),
			currency: data?.currency ?? Configuration.currency(),
			external_reference: data?.external_reference ?? null,
			parent_id: data?.parent_id ?? null,
			notes: data?.notes ?? null,
		},
	};
}

function prepareParamsFromFormValues(
	params: CashFlowFormValuesType,
): CashFlowParamsType {
	const category_type = getExpectedCategoryType(params.category);
	const direction = getExpectedDirection(
		category_type,
		Number(params.amount),
	);

	return {
		...params,
		direction,
		category_type,
	};
}

export type CashFlowDataTableFiltersType = {
	global: { value: string | null; matchMode: 'contains' };
	direction: { value: CashFlowDirection | null; matchMode: 'equals' };
	category: { value: CashFlowCategory | null; matchMode: 'equals' };
	method: { value: CashFlowMethod | null; matchMode: 'equals' };
	currency: { value: Currency | null; matchMode: 'equals' };
	status: { value: CashFlowStatus | null; matchMode: 'equals' };
	create_date_start: { value: string | null; matchMode: 'equals' };
	create_date_end: { value: string | null; matchMode: 'equals' };
	is_deleted: { value: boolean; matchMode: 'equals' };
};

export const dataSourceConfigCashFlow: DataSourceConfigType<
	CashFlowModel,
	CashFlowFormValuesType
> = {
	dataTable: {
		state: {
			first: 0,
			rows: 10,
			sortField: 'id',
			sortOrder: -1 as const,
			filters: {
				global: { value: null, matchMode: 'contains' },
				direction: { value: null, matchMode: 'equals' },
				category: { value: null, matchMode: 'equals' },
				method: { value: null, matchMode: 'equals' },
				currency: { value: null, matchMode: 'equals' },
				status: { value: null, matchMode: 'equals' },
				create_date_start: { value: null, matchMode: 'equals' },
				create_date_end: { value: null, matchMode: 'equals' },
				is_deleted: { value: false, matchMode: 'equals' },
			} satisfies CashFlowDataTableFiltersType,
		},
		columns: [
			{
				field: 'id',
				header: 'ID',
				sortable: true,
				body: (
					entry: CashFlowModel,
					column: DataTableColumnType<CashFlowModel>,
				) =>
					DataTableValue(entry, column, {
						markDeleted: true,
						displayButton: {
							action: 'view',
							dataSource: 'cash-flow',
						},
					}),
			},
			{
				field: 'category_type',
				header: 'Type',
				body: (
					entry: CashFlowModel,
					column: DataTableColumnType<CashFlowModel>,
				) =>
					DataTableValue(entry, column, {
						customValue: formatEnumLabel(entry.category_type),
					}),
			},
			{
				field: 'category',
				header: 'Category',
				sortable: true,
				body: (
					entry: CashFlowModel,
					column: DataTableColumnType<CashFlowModel>,
				) =>
					DataTableValue(entry, column, {
						customValue: formatEnumLabel(entry.category),
					}),
			},
			{
				field: 'amount',
				header: 'Amount',
				body: (
					entry: CashFlowModel,
					column: DataTableColumnType<CashFlowModel>,
				) =>
					DataTableValue(entry, column, {
						customValue: DisplayAmount({
							amount: entry.amount,
							currencyCode: entry.currency,
							sign:
								entry.direction === CashFlowDirectionEnum.OUT
									? -1
									: 1,
						}),
					}),
			},
			{
				field: 'method',
				header: 'Method',
				body: (
					entry: CashFlowModel,
					column: DataTableColumnType<CashFlowModel>,
				) =>
					DataTableValue(entry, column, {
						customValue: formatEnumLabel(entry.method),
					}),
			},
			{
				field: 'external_reference',
				header: 'Reference',
			},
			{
				field: 'status',
				header: 'Status',
				body: (
					entry: CashFlowModel,
					column: DataTableColumnType<CashFlowModel>,
				) =>
					DataTableValue(entry, column, {
						isStatus: true,
						markDeleted: true,
						displayButton: {
							action: (entry: CashFlowModel) => {
								if (entry.deleted_at) {
									return undefined;
								}

								const statusTransitions = getStatusTransitions(
									entry.status,
								);

								if (statusTransitions.length === 0) {
									return undefined;
								}

								if (
									entry.status === CashFlowStatusEnum.PENDING
								) {
									return 'complete';
								}

								return 'drop';
							},
							dataSource: 'cash-flow',
						},
					}),
				style: {
					minWidth: '10rem',
					maxWidth: '10rem',
				},
			},
			{
				field: 'created_at',
				header: 'Created At',
				sortable: true,
				body: (
					entry: CashFlowModel,
					column: DataTableColumnType<CashFlowModel>,
				) =>
					DataTableValue(entry, column, {
						displayDate: true,
					}),
			},
		],
		find: (params: FindFunctionParamsType) =>
			requestFind<CashFlowModel>('cash-flow', params),
	},
	displayEntryLabel: (entry: CashFlowModel) => {
		const formatted = formatAmount(entry.amount, entry.currency);

		return `${formatted.value} ${formatted.currency} (#${entry.id})`;
	},
	actions: {
		create: {
			windowType: 'form',
			windowTitle: translations['create.title'],
			windowComponent: FormManageCashFlow,
			permission: 'cash-flow.create',
			entriesSelection: 'free',
			operationFunction: (values: CashFlowFormValuesType) =>
				requestCreate<CashFlowModel, CashFlowParamsType>(
					'cash-flow',
					prepareParamsFromFormValues(values),
				),
			buttonPosition: 'right',
			button: {
				variant: 'info',
			},
			getFormValues: getFormValues,
			validateForm: validateForm,
			getFormState: getFormState,
		},
		refund: {
			windowType: 'form',
			windowTitle: translations['refund.title'],
			windowComponent: FormManageCashFlow,
			permission: 'cash-flow.refund',
			entriesSelection: 'single',
			customEntryCheck: (entry: CashFlowModel) =>
				arrayHasValue(entry.status, REFUNDABLE_STATUSES),
			operationFunction: (values: CashFlowFormValuesType) =>
				requestCreate<CashFlowModel, CashFlowParamsType>(
					'cash-flow',
					prepareParamsFromFormValues(values),
				),
			prepareEntry: (entry: CashFlowModel) => {
				return {
					category: CashFlowCategoryEnum.REFUND,
					method: entry.method,
					amount: -Math.abs(entry.amount),
					vat_rate: entry.vat_rate,
					currency: entry.currency,
					external_reference: entry.external_reference
						? `REFUND ${entry.external_reference}`
						: null,
					parent_id: entry.id,
				};
			},
			buttonPosition: 'right',
			button: {
				variant: 'success',
			},
			getFormValues: getFormValues,
			validateForm: validateForm,
			getFormState: getFormState,
		},
		update: {
			windowType: 'form',
			windowTitle: translations['update.title'],
			windowComponent: FormManageCashFlow,
			permission: 'cash-flow.update',
			entriesSelection: 'single',
			customEntryCheck: (entry: CashFlowModel) =>
				arrayHasValue(entry.status, MUTABLE_STATUSES),
			operationFunction: (values: CashFlowFormValuesType, id: number) =>
				requestUpdate<CashFlowModel, CashFlowFormValuesType>(
					'cash-flow',
					prepareParamsFromFormValues(values),
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
			permission: 'cash-flow.delete',
			entriesSelection: 'single',
			customEntryCheck: (entry: CashFlowModel) => !entry.deleted_at, // Return true if the entry is not deleted
			operationFunction: (entry: CashFlowModel) =>
				requestDelete('cash-flow', entry),
			buttonPosition: 'left',
			button: {
				variant: 'outline',
				hover: 'error',
			},
		},
		complete: {
			windowType: 'action',
			windowTitle: translations['complete.title'],
			permission: 'cash-flow.update',
			entriesSelection: 'single',
			customEntryCheck: (entry: CashFlowModel) => {
				const statusTransitions = getStatusTransitions(entry.status);

				return (
					!entry.deleted_at &&
					arrayHasValue(
						CashFlowStatusEnum.COMPLETED,
						statusTransitions,
					)
				);
			},
			operationFunction: (entry: CashFlowModel) =>
				requestUpdateStatus('cash-flow', entry, 'completed'),
			buttonPosition: 'left',
			button: {
				variant: 'outline',
				hover: 'info',
			},
		},
		drop: {
			windowType: 'action',
			windowTitle: translations['drop.title'],
			permission: 'cash-flow.update',
			entriesSelection: 'single',
			customEntryCheck: (entry: CashFlowModel) => {
				const statusTransitions = getStatusTransitions(entry.status);

				return (
					!entry.deleted_at &&
					arrayHasValue(
						CashFlowStatusEnum.CANCELED,
						statusTransitions,
					)
				);
			},
			operationFunction: (entry: CashFlowModel) =>
				requestUpdateStatus('cash-flow', entry, 'canceled'),
			buttonPosition: 'left',
			button: {
				variant: 'outline',
				hover: 'error',
			},
		},
		view: {
			windowType: 'view',
			windowTitle: translations['view.title'],
			windowComponent: ViewCashFlow,
			windowConfigProps: {
				size: 'xl',
			},
			permission: 'cash-flow.read',
			entriesSelection: 'single',
			buttonPosition: 'hidden',
		},
	},
};
