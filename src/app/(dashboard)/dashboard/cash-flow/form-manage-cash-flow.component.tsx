import { useMemo } from 'react';
import {
	FormComponentInput,
	FormComponentSelect,
	FormComponentTextarea,
} from '@/components/form/form-element.component';
import type { FormManageType } from '@/config/data-source.config';
import { formatEnumLabel } from '@/helpers/string.helper';
import { useElementIds } from '@/hooks/use-element-ids.hook';
import {
	type CashFlowFormValuesType,
	CashFlowCategoryEnum,
	CashFlowMethodEnum,
	CurrencyEnum,
} from '@/models/cash-flow.model';

const categories = Object.values(CashFlowCategoryEnum).map((v) => ({
	label: formatEnumLabel(v),
	value: v,
}));

const methods = Object.values(CashFlowMethodEnum).map((v) => ({
	label: formatEnumLabel(v),
	value: v,
}));

const currencies = Object.values(CurrencyEnum).map((v) => ({
	label: v,
	value: v,
}));

export function FormManageCashFlow({
	formValues,
	errors,
	handleChange,
	pending,
}: FormManageType<CashFlowFormValuesType>) {
	const elementIds = useElementIds([
		'category',
		'method',
		'amount',
		'vatRate',
		'currency',
		'exchangeRate',
		'externalReference',
		'notes',
	]);

	return (
		<>
			<FormComponentSelect<CashFlowFormValuesType>
				labelText="Category"
				id={elementIds.category}
				fieldName="category"
				fieldValue={formValues.category}
				options={categories}
				disabled={pending}
				onValueChange={(value) =>
					handleChange('category', value as CashFlowCategoryEnum)
				}
				error={errors.category}
			/>

			<FormComponentSelect<CashFlowFormValuesType>
				labelText="Method"
				id={elementIds.method}
				fieldName="method"
				fieldValue={formValues.method}
				options={methods}
				disabled={pending}
				onValueChange={(value) =>
					handleChange('method', value as CashFlowMethodEnum)
				}
				error={errors.method}
			/>

			<FormComponentInput<CashFlowFormValuesType>
				labelText="Amount"
				id={elementIds.amount}
				fieldName="amount"
				fieldValue={String(formValues.amount)}
				fieldType="number"
				isRequired={true}
				disabled={pending}
				onChange={(e) =>
					handleChange('amount', e.target.value ? Number(e.target.value) : 0)
				}
				error={errors.amount}
			/>

			<FormComponentInput<CashFlowFormValuesType>
				labelText="VAT Rate (%)"
				id={elementIds.vatRate}
				fieldName="vat_rate"
				fieldValue={String(formValues.vat_rate)}
				fieldType="number"
				isRequired={false}
				disabled={pending}
				onChange={(e) =>
					handleChange(
						'vat_rate',
						e.target.value ? Number(e.target.value) : 0,
					)
				}
				error={errors.vat_rate}
			/>

			<FormComponentSelect<CashFlowFormValuesType>
				labelText="Currency"
				id={elementIds.currency}
				fieldName="currency"
				fieldValue={formValues.currency}
				options={currencies}
				disabled={pending}
				onValueChange={(value) =>
					handleChange('currency', value as CurrencyEnum)
				}
				error={errors.currency}
			/>

			<FormComponentInput<CashFlowFormValuesType>
				labelText="Exchange Rate"
				id={elementIds.exchangeRate}
				fieldName="exchange_rate"
				fieldValue={String(formValues.exchange_rate)}
				fieldType="number"
				isRequired={false}
				disabled={pending}
				onChange={(e) =>
					handleChange(
						'exchange_rate',
						e.target.value ? Number(e.target.value) : 1,
					)
				}
				error={errors.exchange_rate}
			/>

			<FormComponentInput<CashFlowFormValuesType>
				labelText="External Reference"
				id={elementIds.externalReference}
				fieldName="external_reference"
				fieldValue={formValues.external_reference ?? ''}
				isRequired={false}
				disabled={pending}
				onChange={(e) =>
					handleChange('external_reference', e.target.value || null)
				}
				error={errors.external_reference}
			/>

			<FormComponentTextarea<CashFlowFormValuesType>
				labelText="Notes"
				id={elementIds.notes}
				fieldName="notes"
				fieldValue={formValues.notes ?? ''}
				isRequired={false}
				disabled={pending}
				onChange={(e) => handleChange('notes', e.target.value || null)}
				error={errors.notes}
				rows={4}
			/>
		</>
	);
}
