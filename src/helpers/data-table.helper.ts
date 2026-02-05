import type { Nullable } from 'primereact/ts-helpers';
import type { DataTableFiltersType } from '@/config/data-source';
import { formatDate } from '@/helpers/date.helper';

export type MatchModeType = 'contains' | 'equals' | 'dateAfter' | 'dateBefore';

export function createFilterHandlers<TableFilters extends DataTableFiltersType>(
	update: <T extends keyof TableFilters>(
		newFilters: Pick<TableFilters, T>,
	) => void,
) {
	return {
		handleInputChange: <F extends keyof TableFilters>(
			field: F,
			value: string,
		) =>
			update({
				[field]: { value, matchMode: 'contains' as const },
			} as Pick<TableFilters, F>),

		handleSelectChange: <F extends keyof TableFilters>(
			field: F,
			value: string | number,
		) =>
			update({
				[field]: { value, matchMode: 'equals' as const },
			} as Pick<TableFilters, F>),

		handleCheckboxChange: <F extends keyof TableFilters>(
			field: F,
			value: boolean,
		) =>
			update({
				[field]: { value, matchMode: 'equals' as const },
			} as Pick<TableFilters, F>),

		handleDateChange: <F extends keyof TableFilters>(
			field: F,
			value: Nullable<Date>,
			matchMode: MatchModeType,
		) =>
			update({
				[field]: {
					value: formatDate(value, 'default'),
					matchMode: matchMode,
				},
			} as Pick<TableFilters, F>),
	};
}
