'use client';

import { type JSX, useCallback, useMemo } from 'react';
import { useStore } from 'zustand/react';
import {
	FormFiltersDateRange,
	FormFiltersReset,
	FormFiltersSearch,
	FormFiltersSelect,
} from '@/app/(dashboard)/_components/form-filters.component';
import { useDataTable } from '@/app/(dashboard)/_providers/data-table.provider';
import type { LogDataDataTableFiltersType } from '@/app/(dashboard)/dashboard/log-data/log-data.definition';
import { toOptionsFromEnum } from '@/helpers/form.helper';
import { formatEnumLabel } from '@/helpers/string.helper';
import { useDataTableFilterReset } from '@/hooks/use-data-table-filter-reset.hook';
import { useSearchFilter } from '@/hooks/use-search-filter.hook';
import {
	LogCategoryEnum,
	type LogDataModel,
	LogLevelEnum,
} from '@/models/log-data.model';

const logLevels = toOptionsFromEnum(LogLevelEnum, {
	formatter: formatEnumLabel,
});

const logCategories = toOptionsFromEnum(LogCategoryEnum, {
	formatter: formatEnumLabel,
});

export const DataTableLogDataFilters = (): JSX.Element => {
	const { dataSource, dataTableStateDefault, dataTableStore } = useDataTable<
		'log-data',
		LogDataModel
	>();

	const filters = useStore(
		dataTableStore,
		(state) => state.tableState.filters,
	) as LogDataDataTableFiltersType;

	const updateTableState = useStore(
		dataTableStore,
		(state) => state.updateTableState,
	);

	const setFilterValue = useCallback(
		<K extends keyof LogDataDataTableFiltersType>(
			key: K,
			value: LogDataDataTableFiltersType[K]['value'],
		) => {
			updateTableState({
				filters: {
					...filters,
					[key]: {
						...filters[key],
						value,
					},
				},
			});
		},
		[filters, updateTableState],
	);

	const searchGlobal = useSearchFilter({
		initialValue: filters.global.value ?? '',
		debounceDelay: 1000,
		minLength: 3,
		onSearch: (value) => setFilterValue('global', value),
	});

	const resetCallbacks = useMemo(
		() => [searchGlobal.onReset],
		[searchGlobal.onReset],
	);

	useDataTableFilterReset({
		dataSource,
		defaultFilters: dataTableStateDefault.filters,
		updateTableState,
		onReset: resetCallbacks,
	});

	return (
		<div className="form-section flex-row flex-wrap gap-4 border-b border-line pb-4">
			<FormFiltersSearch<LogDataDataTableFiltersType>
				labelText="ID / PID / Message / Context"
				search={searchGlobal}
			/>

			<FormFiltersSelect<LogDataDataTableFiltersType>
				labelText="Category"
				fieldName="category"
				fieldValue={filters.category.value}
				options={logCategories}
				onValueChange={(value) =>
					setFilterValue('category', value as LogCategoryEnum)
				}
			/>

			<FormFiltersSelect<LogDataDataTableFiltersType>
				labelText="Level"
				fieldName="level"
				fieldValue={filters.level.value}
				options={logLevels}
				onValueChange={(value) =>
					setFilterValue('level', value as LogLevelEnum)
				}
			/>

			<FormFiltersDateRange<LogDataDataTableFiltersType>
				labelText="Created At"
				start={{
					fieldName: 'create_date_start',
					fieldValue: filters.create_date_start.value,
					onSelect: (value) =>
						setFilterValue('create_date_start', value),
				}}
				end={{
					fieldName: 'create_date_end',
					fieldValue: filters.create_date_end.value,
					onSelect: (value) =>
						setFilterValue('create_date_end', value),
				}}
			/>

			<FormFiltersReset dataSource="log-data" />
		</div>
	);
};
