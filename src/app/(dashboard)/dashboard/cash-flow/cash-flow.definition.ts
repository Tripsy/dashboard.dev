import { z } from 'zod';
import {
	type DataTableColumnType,
	DataTableValue,
} from '@/app/(dashboard)/_components/data-table-value';
import type { FormStateType } from '@/config/data-source.config';
import { DisplayAmount } from '@/helpers/display.helper';
import { formatEnumLabel } from '@/helpers/string.helper';
import {
	CashFlowCategoryEnum,
	CashFlowDirectionEnum,
	type CashFlowFormValuesType,
	CashFlowMethodEnum,
	type CashFlowModel,
	type CashFlowStatusEnum,
	CurrencyEnum,
} from '@/models/cash-flow.model';
import {
	createCashFlow,
	deleteCashFlow,
	findCashFlows,
	updateCashFlow,
} from '@/services/cash-flow.service';
import {BaseValidator} from "@/helpers/validator.helper";

const validatorMessages = await BaseValidator.getValidatorMessages(
	[
		'invalid_category',
		'invalid_method',
		'invalid_amount',
		'invalid_vat_rate',
		'invalid_currency',
		'invalid_exchange_rate',
		'invalid_external_reference',
		'invalid_notes',
	] as const,
	'cash-flow.validation',
);

// const ValidateSchemaCashFlow = z.object({
// 	address_type: validateEnum(
// 		CashFlowCategoryEnum,
// 		translations['cash-flow.validation.invalid_category'],
// 	),
// 	method: validateEnum(
// 		CashFlowMethodEnum,
// 		translations['cash-flow.validation.invalid_method'],
// 	),
// 	amount: validateNumber(translations['cash-flow.validation.invalid_amount']),
// 	vat_rate: validateNumber(
// 		translations['cash-flow.validation.invalid_vat_rate'],
// 		true,
// 		true,
// 	)
// 		.min(0, translations['cash-flow.validation.invalid_vat_rate'])
// 		.max(100, translations['cash-flow.validation.invalid_vat_rate']),
// 	currency: validateEnum(
// 		CurrencyEnum,
// 		translations['cash-flow.validation.invalid_currency'],
// 	),
// 	exchange_rate: validateNumber(
// 		translations['cash-flow.validation.invalid_exchange_rate'],
// 		true,
// 		true,
// 	),
// 	external_reference: validateString(
// 		translations['cash-flow.validation.invalid_external_reference'],
// 	).optional(),
// 	notes: validateString(
// 		translations['cash-flow.validation.invalid_notes'],
// 	).optional(),
// });

export function getFormValuesCashFlow(
	formData: FormData,
): CashFlowFormValuesType {
	const categoryRaw = formData.get('category') as CashFlowCategoryEnum | null;
	const category = Object.values(CashFlowCategoryEnum).includes(
		categoryRaw as CashFlowCategoryEnum,
	)
		? (categoryRaw as CashFlowCategoryEnum)
		: CashFlowCategoryEnum.CUSTOMER;

	const methodRaw = formData.get('method') as CashFlowMethodEnum | null;
	const method = Object.values(CashFlowMethodEnum).includes(
		methodRaw as CashFlowMethodEnum,
	)
		? (methodRaw as CashFlowMethodEnum)
		: CashFlowMethodEnum.BANK_TRANSFER;

	const currencyRaw = formData.get('currency') as CurrencyEnum | null;
	const currency = Object.values(CurrencyEnum).includes(
		currencyRaw as CurrencyEnum,
	)
		? (currencyRaw as CurrencyEnum)
		: CurrencyEnum.RON;

	const amountRaw = formData.get('amount');
	const vatRateRaw = formData.get('vat_rate');
	const exchangeRateRaw = formData.get('exchange_rate');

	return {
		category,
		method,
		amount: amountRaw ? Number(amountRaw) : 0,
		vat_rate: vatRateRaw ? Number(vatRateRaw) : 0,
		currency,
		exchange_rate: exchangeRateRaw ? Number(exchangeRateRaw) : 1,
		external_reference:
			(formData.get('external_reference') as string) || null,
		notes: (formData.get('notes') as string) || null,
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
			method: CashFlowMethodEnum.BANK_TRANSFER,
			amount: 0,
			vat_rate: 0,
			currency: CurrencyEnum.RON,
			exchange_rate: 1,
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
			// return ValidateSchemaCashFlow.safeParse(values);
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
					exchange_rate: model.exchange_rate,
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
