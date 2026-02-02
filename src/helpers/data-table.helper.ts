import type { Nullable } from 'primereact/ts-helpers';
import type {
	DataSourceTableFilter,
	DataSourceType,
} from '@/config/data-source';
import { formatDate } from '@/helpers/date.helper';

export type MatchModeType = 'contains' | 'equals' | 'dateAfter' | 'dateBefore';

export function createFilterHandlers<K extends keyof DataSourceType>(
	update: <T extends keyof DataSourceTableFilter<K>>(
		newFilters: Pick<DataSourceTableFilter<K>, T>,
	) => void,
) {
	return {
		handleInputChange: <F extends keyof DataSourceTableFilter<K>>(
			field: F,
			value: string,
		) =>
			update({
				[field]: { value, matchMode: 'contains' as MatchModeType },
			} as Pick<DataSourceTableFilter<K>, F>),

		handleSelectChange: <F extends keyof DataSourceTableFilter<K>>(
			field: F,
			value: string | number,
		) =>
			update({
				[field]: { value, matchMode: 'equals' as MatchModeType },
			} as Pick<DataSourceTableFilter<K>, F>),

		handleCheckboxChange: <F extends keyof DataSourceTableFilter<K>>(
			field: F,
			value: boolean,
		) =>
			update({
				[field]: { value, matchMode: 'equals' },
			} as Pick<DataSourceTableFilter<K>, F>),

		handleDateChange: <F extends keyof DataSourceTableFilter<K>>(
			field: F,
			value: Nullable<Date>,
			matchMode: MatchModeType,
		) =>
			update({
				[field]: {
					value: formatDate(value, 'default'),
					matchMode: matchMode,
				},
			} as Pick<DataSourceTableFilter<K>, F>),
	};
}
