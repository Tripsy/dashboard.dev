import {
	FormComponentInput,
	FormComponentRadio,
	FormComponentSelect,
	FormComponentTextarea,
} from '@/components/form/form-element.component';
import { toOptionsFromEnum } from '@/helpers/form.helper';
import { formatEnumLabel } from '@/helpers/string.helper';
import { useElementIds } from '@/hooks/use-element-ids.hook';
import {
	type CashFlowCategory,
	CashFlowCategoryEnum,
	type CashFlowFormValuesType,
	type CashFlowMethod,
	CashFlowMethodEnum,
	filterGroupedCategories,
} from '@/models/cash-flow.model';
import { useWindowForm } from '@/providers/window-form.provider';
import { type Currency, CurrencyEnum } from '@/types/common.type';

const groupedCategories = filterGroupedCategories([
	CashFlowCategoryEnum.REFUND,
]);

const methods = toOptionsFromEnum(CashFlowMethodEnum, {
	formatter: formatEnumLabel,
});

const currencies = toOptionsFromEnum(CurrencyEnum, {
	formatter: formatEnumLabel,
});

export function FormManageCashFlow({ action }: { action: string }) {
	const { formValues, errors, handleChange, pending } =
		useWindowForm<CashFlowFormValuesType>();

	const elementIds = useElementIds([
		'category',
		'method',
		'amount',
		'vatRate',
		'currency',
		'externalReference',
		'notes',
	] as const);

	return (
		<>
			{action === 'refund' && (
				<>
					<input
						type="hidden"
						name="parent_id"
						value={formValues.parent_id ?? ''}
					/>
					<input
						type="hidden"
						name="category"
						value={CashFlowCategoryEnum.REFUND}
					/>
				</>
			)}

			{action !== 'refund' && (
				<FormComponentSelect<CashFlowFormValuesType>
					labelText="Category"
					id={elementIds.category}
					fieldName="category"
					fieldValue={formValues.category}
					disabled={pending}
					isRequired={true}
					options={groupedCategories}
					onChange={(value) =>
						handleChange('category', value as CashFlowCategory)
					}
					error={errors.category}
				/>
			)}

			<FormComponentSelect<CashFlowFormValuesType>
				labelText="Method"
				id={elementIds.method}
				fieldName="method"
				fieldValue={formValues.method}
				disabled={pending}
				isRequired={true}
				options={methods}
				onChange={(value) =>
					handleChange('method', value as CashFlowMethod)
				}
				error={errors.method}
			/>

			<div className="flex flex-wrap gap-2">
				<FormComponentInput<CashFlowFormValuesType>
					labelText="Amount"
					id={elementIds.amount}
					fieldName="amount"
					fieldType="number"
					step={0.01}
					fieldValue={formValues.amount ?? null}
					disabled={pending}
					isRequired={true}
					onChange={(e) =>
						handleChange('amount', Number(e.target.value))
					}
					error={errors.amount}
				/>

				<FormComponentInput<CashFlowFormValuesType>
					labelText="Vat Rate"
					id={elementIds.vatRate}
					fieldName="vat_rate"
					fieldType="number"
					fieldValue={formValues.vat_rate ?? null}
					disabled={pending}
					isRequired={true}
					onChange={(e) =>
						handleChange('vat_rate', Number(e.target.value))
					}
					error={errors.vat_rate}
				/>
			</div>

			<FormComponentRadio<CashFlowFormValuesType>
				labelText="Currency"
				id={elementIds.currency}
				fieldName="currency"
				fieldValue={formValues.currency}
				disabled={pending}
				options={currencies}
				onChange={(value) =>
					handleChange('currency', value as Currency)
				}
				error={errors.currency}
			/>

			<FormComponentInput<CashFlowFormValuesType>
				labelText="External Reference"
				id={elementIds.externalReference}
				fieldName="external_reference"
				fieldValue={formValues.external_reference ?? ''}
				isRequired={false}
				disabled={pending}
				onChange={(e) =>
					handleChange('external_reference', e.target.value)
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
				onChange={(e) => handleChange('notes', e.target.value)}
				error={errors.notes}
				rows={4}
			/>
		</>
	);
}
