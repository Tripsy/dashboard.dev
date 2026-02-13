import { useMemo } from 'react';
import { handleReset } from '@/app/(dashboard)/_components/data-table-actions.component';
import {
	FormComponentCalendarWithoutFormElement,
	FormComponentCheckbox,
	FormComponentInput,
	FormComponentSelect,
	type OptionsType,
} from '@/components/form/form-element.component';
import { Icons } from '@/components/icon.component';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { cn } from '@/helpers/css.helper';
import { useElementIds } from '@/hooks/use-element-ids.hook';
import type { useSearchFilter } from '@/hooks/use-search-filter.hook';
import { useTranslation } from '@/hooks/use-translation.hook';

export function FormFiltersSearch<TFilters>({
	labelText,
	fieldName = 'global' as keyof TFilters,
	placeholderText = 'Search',
	search,
	className,
}: {
	labelText: string;
	fieldName?: keyof TFilters;
	placeholderText?: string;
	search: ReturnType<typeof useSearchFilter>;
	className?: string;
}) {
	const elementKey = `search-${String(fieldName)}`;
	const elementIds = useElementIds([elementKey]);

	return (
		<FormComponentInput
			labelText={labelText}
			id={elementIds[elementKey]}
			fieldName={String(fieldName)}
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

export function FormFiltersSelect<TFilters>({
	labelText,
	fieldName,
	fieldValue,
	placeholderText = 'Select...',
	options,
	onValueChange,
	className,
}: {
	labelText: string;
	fieldName: keyof TFilters;
	fieldValue: string | null;
	placeholderText?: string;
	options: OptionsType;
	onValueChange: (value: string) => void;
	className?: string;
}) {
	const elementKey = `search-${String(fieldName)}`;
	const elementIds = useElementIds([elementKey]);

	return (
		<FormComponentSelect
			labelText={labelText}
			id={elementIds[elementKey]}
			fieldName={String(fieldName)}
			fieldValue={fieldValue}
			className={cn('max-w-64 min-w-32', className)}
			disabled={false}
			placeholderText={placeholderText}
			options={options}
			onValueChange={onValueChange}
		/>
	);
}

type FormFilterDateRangeElementType<K> = {
	fieldName: K;
	fieldValue: string | null;
	placeholderText?: string;
	onSelect: (value: string) => void;
};

export function FormFiltersDateRange<Filters>({
	labelText,
	start,
	end,
}: {
	labelText: string;
	start: FormFilterDateRangeElementType<keyof Filters>;
	end: FormFilterDateRangeElementType<keyof Filters>;
}) {
	const elementKeyStart = `search-${String(start.fieldName)}`;
	const elementKeyEnd = `search-${String(end.fieldName)}`;
	const elementIds = useElementIds([elementKeyStart, elementKeyEnd]);

	const translationsKeys = useMemo(
		() =>
			[
				'dashboard.text.placeholder_start_date',
				'dashboard.text.placeholder_end_date',
			] as const,
		[],
	);

	const { translations } = useTranslation(translationsKeys);

	return (
		<div className="flex flex-col gap-3 h-full">
			<Label htmlFor={elementIds[elementKeyStart]}>{labelText}</Label>
			<div className="flex flex-wrap gap-2">
				<FormComponentCalendarWithoutFormElement
					id={elementIds[elementKeyStart]}
					fieldName={String(start.fieldName)}
					fieldValue={start.fieldValue}
					placeholderText={
						translations['dashboard.text.placeholder_start_date']
					}
					disabled={false}
					onSelect={start.onSelect}
					maxDate={end.fieldValue || undefined}
				/>
				<FormComponentCalendarWithoutFormElement
					id={elementIds[elementKeyEnd]}
					fieldName={String(end.fieldName)}
					fieldValue={end.fieldValue}
					placeholderText={
						translations['dashboard.text.placeholder_end_date']
					}
					disabled={false}
					onSelect={end.onSelect}
					minDate={start.fieldValue || undefined}
				/>
			</div>
		</div>
	);
}

export function FormFiltersShowDeleted({
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
				{translations['dashboard.text.label_checkbox_show_deleted']}
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
				variant="outline"
				hover="warning"
				onClick={() => handleReset(source)}
				title="Reset filters"
			>
				<Icons.Action.Reset />
				{translations['dashboard.text.label_reset']}
			</Button>
		</div>
	);
}
