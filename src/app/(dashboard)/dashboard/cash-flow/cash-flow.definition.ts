import { z } from 'zod';
import {
	type DataTableColumnType,
	DataTableValue,
} from '@/app/(dashboard)/_components/data-table-value';
import { FormManageCashFlow } from '@/app/(dashboard)/dashboard/cash-flow/form-manage-cash-flow.component';
import type { FormStateType } from '@/config/data-source.config';
import { DisplayAmount } from '@/helpers/display.helper';
import {
	getFormDataAsEnum,
	getFormDataAsNumber,
	getFormDataAsString,
} from '@/helpers/form.helper';
import { formatEnumLabel } from '@/helpers/string.helper';
import { BaseValidator } from '@/helpers/validator.helper';
import {
	CashFlowCategoryEnum,
	// CashFlowCategoryTypeEnum,
	CashFlowDirectionEnum,
	type CashFlowFormValuesType,
	// CashFlowGatewayEnum,
	CashFlowMethodEnum,
	type CashFlowModel,
	type CashFlowStatusEnum,
	CURRENCY_DEFAULT,
	CurrencyEnum,
	VAT_RATE_DEFAULT,
} from '@/models/cash-flow.model';
import {
	createCashFlow,
	deleteCashFlow,
	findCashFlows,
	updateCashFlow,
} from '@/services/cash-flow.service';

const validatorMessages = await BaseValidator.getValidatorMessages(
	[
		// 'invalid_direction',
		// 'invalid_category_type',
		'invalid_category',
		// 'invalid_gateway',
		'invalid_method',
		'invalid_amount',
		'invalid_vat_rate',
		'invalid_currency',
		'invalid_exchange_rate',
		'invalid_external_reference',
		'invalid_parent_id',
		'invalid_notes',
	] as const,
	'cash-flow.validation',
);

class CashFlowValidator extends BaseValidator<typeof validatorMessages> {
	manage = z.object({
		// direction: this.validateEnum(
		// 	CashFlowDirectionEnum,
		// 	this.getMessage('invalid_direction'),
		// ),
		// category_type: this.validateEnum(
		// 	CashFlowCategoryTypeEnum,
		// 	this.getMessage('invalid_category_type'),
		// ),
		category: this.validateEnum(
			CashFlowCategoryEnum,
			this.getMessage('invalid_category'),
		),
		// gateway: this.validateEnum(
		// 	CashFlowGatewayEnum,
		// 	this.getMessage('invalid_gateway'),
		// ),
		method: this.validateEnum(
			CashFlowMethodEnum,
			this.getMessage('invalid_method'),
		),
		amount: this.validateNumber(this.getMessage('invalid_amount')),
		vat_rate: this.validateNumber(this.getMessage('invalid_vat_rate'), {
			required: true,
			onlyPositive: true,
			allowDecimals: true,
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

export function getFormValuesCashFlow(
	formData: FormData,
): CashFlowFormValuesType {
	return {
		category:
			getFormDataAsEnum(formData, 'category', CashFlowCategoryEnum) ||
			CashFlowCategoryEnum.CUSTOMER,
		method:
			getFormDataAsEnum(formData, 'method', CashFlowMethodEnum) ||
			CashFlowMethodEnum.CASH,
		amount: getFormDataAsNumber(formData, 'amount'),
		vat_rate: getFormDataAsNumber(formData, 'vat_rate'),
		currency:
			getFormDataAsEnum(formData, 'currency', CurrencyEnum) ||
			CURRENCY_DEFAULT,
		external_reference: getFormDataAsString(formData, 'external_reference'),
		notes: getFormDataAsString(formData, 'notes'),
	};
}

export type CashFlowDataTableFiltersType = {
	global: { value: string | null; matchMode: 'contains' };
	direction: { value: CashFlowDirectionEnum | null; matchMode: 'equals' };
	category: { value: CashFlowCategoryEnum | null; matchMode: 'equals' };
	status: { value: CashFlowStatusEnum | null; matchMode: 'equals' };
	currency: { value: CurrencyEnum | null; matchMode: 'equals' };
	create_date_start: { value: string | null; matchMode: 'equals' };
	create_date_end: { value: string | null; matchMode: 'equals' };
};

export const cashFlowDataTableFilters: CashFlowDataTableFiltersType = {
	global: { value: null, matchMode: 'contains' },
	direction: { value: null, matchMode: 'equals' },
	category: { value: null, matchMode: 'equals' },
	status: { value: null, matchMode: 'equals' },
	currency: { value: null, matchMode: 'equals' },
	create_date_start: { value: null, matchMode: 'equals' },
	create_date_end: { value: null, matchMode: 'equals' },
};

export const dataSourceConfigCashFlow = {
	dataTableState: {
		reloadTrigger: 0,
		first: 0,
		rows: 10,
		sortField: 'id',
		sortOrder: -1 as const,
		filters: cashFlowDataTableFilters,
	},
	dataTableColumns: [
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
						cents: entry.amount,
						currencyCode: entry.currency,
						sign:
							entry.direction === CashFlowDirectionEnum.OUT
								? -1
								: 1,
					}),
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
					customValue: formatEnumLabel(entry.status),
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
	formState: {
		dataSource: 'cash-flow' as const,
		id: undefined,
		values: {
			category: CashFlowCategoryEnum.CUSTOMER,
			method: CashFlowMethodEnum.CASH,
			amount: 0,
			vat_rate: VAT_RATE_DEFAULT,
			currency: CURRENCY_DEFAULT,
			external_reference: null,
			notes: null,
		} as CashFlowFormValuesType,
		errors: {},
		message: null,
		situation: null,
	},
	functions: {
		find: findCashFlows,
		getFormValues: getFormValuesCashFlow,
		validateForm: (values: CashFlowFormValuesType) => {
			return new CashFlowValidator(validatorMessages).manage.safeParse(
				values,
			);
		},
		syncFormState: (
			state: FormStateType<
				'cash-flow',
				CashFlowModel,
				CashFlowFormValuesType
			>,
			model: CashFlowModel,
		): FormStateType<
			'cash-flow',
			CashFlowModel,
			CashFlowFormValuesType
		> => {
			return {
				...state,
				id: model.id,
				values: {
					...state.values,
					category: model.category,
					method: model.method,
					amount: model.amount,
					vat_rate: model.vat_rate,
					currency: model.currency,
					external_reference: model.external_reference ?? null,
					notes: model.notes,
				},
			};
		},
		displayActionEntries: (entries: CashFlowModel[]) => {
			return entries.map((entry) => ({
				id: entry.id,
				label: `#${entry.id} ${DisplayAmount({
					cents: entry.amount,
					currencyCode: entry.currency,
					sign:
						entry.direction === CashFlowDirectionEnum.OUT ? -1 : 1,
				})}`,
			}));
		},
	},
	actions: {
		create: {
			mode: 'form' as const,
			component: FormManageCashFlow,
			permission: 'cash_flow.create',
			allowedEntries: 'free' as const,
			position: 'right' as const,
			function: createCashFlow,
			buttonProps: {
				variant: 'info' as const,
			},
		},
		update: {
			mode: 'form' as const,
			component: FormManageCashFlow,
			permission: 'cash_flow.update',
			allowedEntries: 'single' as const,
			position: 'left' as const,
			function: updateCashFlow,
			buttonProps: {
				variant: 'outline' as const,
				hover: 'success' as const,
			},
		},
		delete: {
			mode: 'action' as const,
			permission: 'cash_flow.delete',
			allowedEntries: 'single' as const,
			position: 'left' as const,
			function: deleteCashFlow,
			buttonProps: {
				variant: 'outline' as const,
				hover: 'error' as const,
			},
		},
	},
};
