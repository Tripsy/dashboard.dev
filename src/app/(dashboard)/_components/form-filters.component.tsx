import React, { useMemo } from 'react';
import { handleReset } from '@/app/(dashboard)/_components/data-table-actions.component';
import {
	FormComponentCheckbox,
	FormComponentInput,
	FormComponentSelect,
	type OptionsType,
} from '@/components/form/form-element.component';
import { Icons } from '@/components/icon.component';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import type { DataTableFiltersType } from '@/config/data-source.config';
import { useElementIds } from '@/hooks/use-element-ids.hook';
import type { useSearchFilter } from '@/hooks/use-search-filter.hook';
import { useTranslation } from '@/hooks/use-translation.hook';
import {cn} from "@/helpers/css.helper";

export function createValueChangeHandler<TFilters extends DataTableFiltersType>(
	filters: TFilters,
	updateFilters: <K extends keyof TFilters>(
		key: K,
		value: TFilters[K],
	) => void,
	mapper?: <K extends keyof TFilters>(
		prev: TFilters[K],
		value: TFilters[K]['value'],
	) => TFilters[K],
) {
	return <K extends keyof TFilters>(key: K) =>
		(value: TFilters[K]['value']) => {
			const prev = filters[key];

			const next = mapper ? mapper(prev, value) : { ...prev, value };

			updateFilters(key, next);
		};
}

export function FormFiltersSearch({
	labelText,
	fieldName = 'global',
	placeholderText = 'Search',
	search,
	className,
}: {
	labelText: string;
	fieldName?: string;
	placeholderText?: string;
	search: ReturnType<typeof useSearchFilter>;
	className?: string;
}) {
	const elementKey = `search-${fieldName}`;
	const elementIds = useElementIds([elementKey]);

	return (
		<FormComponentInput
			labelText={labelText}
			id={elementIds[elementKey]}
			fieldName={fieldName}
			fieldValue={search.value}
			className={cn('pl-8 max-w-64', className)}
			placeholderText={placeholderText}
			icons={{
				left: <Icons.Search className="opacity-40 h-4.5 w-4.5" />,
			}}
			disabled={false}
			onChange={search.handler}
		/>
	);
}

export function FormFiltersSelect({
	labelText,
	fieldName,
	fieldValue,
	placeholderText = 'Select...',
	options,
	onValueChange,
	className,
}: {
	labelText: string;
	fieldName: string;
	fieldValue: string | null;
	placeholderText?: string;
	options: OptionsType;
	onValueChange: (value: string) => void;
	className?: string;
}) {
	const elementKey = `search-${fieldName}`;
	const elementIds = useElementIds([elementKey]);

	return (
		<FormComponentSelect
			labelText={labelText}
			id={elementIds[elementKey]}
			fieldName={fieldName}
			fieldValue={fieldValue}
			className={cn('max-w-64 min-w-32', className)}
			disabled={false}
			placeholderText={placeholderText}
			options={options}
			onValueChange={onValueChange}
		/>
	);
}

// export function FormFiltersDateRange<Filters>({
//   labelText,
//   start,
//   end,
//   onValueChange
// }: {
// 	labelText: string;
// 	start: { fieldName: keyof Filters extends string; fieldValue: string };
// 	end: { fieldName: keyof Filters extends string; fieldValue: string };
// 	onValueChange: (value: string) => void;
// }) {
//
// 	const elementStartKey = `search-${start.fieldName}`;
// 	const elementEndKey = `search-${end.fieldName}`;
// 	const elementIds = useElementIds([elementStartKey, elementEndKey]);
//
// 	const translationsKeys = useMemo(
// 		() =>
// 			[
// 				'dashboard.text.placeholder_start_date',
// 				'dashboard.text.placeholder_end_date',
// 			] as const,
// 		[],
// 	);
//
// 	const { translations } = useTranslation(translationsKeys);
//
// 	return (
// 		<FormPart>
// 			<FormElement
// 				labelText={labelText}
// 				labelFor={elementIds[elementStartKey]}
// 			>
// 				<div className="flex gap-2">
// 					<Calendar
// 						className="h-11 w-[160px]"
// 						id={elementIds[elementStartKey]}
// 						value={toDateInstance(startDateValue)}
// 						onChange={(e) =>
// 							handleDateChange(
// 								startDateField as keyof Filters,
// 								e.value,
// 								'dateAfter',
// 							)
// 						}
// 						placeholder={
// 							translations[
// 								'dashboard.text.placeholder_start_date'
// 							]
// 						}
// 						showIcon
// 						maxDate={getValidDate(endDateValue)}
// 					/>
// 					<Calendar
// 						className="h-11 w-[160px]"
// 						id={elementIds[elementEndKey]}
// 						value={toDateInstance(endDateValue)}
// 						onChange={(e) =>
// 							handleDateChange(
// 								endDateField as keyof Filters,
// 								e.value,
// 								'dateBefore',
// 							)
// 						}
// 						placeholder={
// 							translations['dashboard.text.placeholder_end_date']
// 						}
// 						showIcon
// 						minDate={getValidDate(startDateValue)}
// 					/>
// 				</div>
// 			</FormElement>
// 		</FormPart>
// 	);
// }

export function FormFiltersShowDeleted<Filters>({
	checked = false,
	onCheckedChange,
}: {
	checked: boolean;
	onCheckedChange: (checked: boolean) => void;
}) {
	const elementIds = useElementIds(['search-is-deleted']);

	const translationsKeys = useMemo(
		() => ['dashboard.text.label_checkbox_show_deleted'] as const,
		[],
	);

	const { translations } = useTranslation(translationsKeys);

	return (
		<div className="flex self-end pb-3">
			<FormComponentCheckbox
				id={elementIds['search-is-deleted']}
				onCheckedChange={onCheckedChange}
				fieldName="terms"
				checked={checked}
				disabled={false}
			>
				{
					translations[
						'dashboard.text.label_checkbox_show_deleted'
						]
				}
			</FormComponentCheckbox>
		</div>
	);
}

export function FormFiltersReset({ source }: { source: string }) {
	const translationsKeys = useMemo(
		() => ['dashboard.text.label_reset'] as const,
		[],
	);

	const { translations } = useTranslation(translationsKeys);

	return (
		<div className="flex self-end">
			<Button
				type="reset"
				variant="cancel"
				onClick={() => handleReset(source)}
				title="Reset filters"
			>
				<Icons.Action.Reset />
				{translations['dashboard.text.label_reset']}
			</Button>
		</div>
	);
}
