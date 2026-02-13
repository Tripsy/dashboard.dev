'use client';

import { type JSX, useCallback, useEffect, useMemo } from 'react';
import { useStore } from 'zustand/react';
import {
	FormFiltersDateRange,
	FormFiltersReset,
	FormFiltersSearch,
	FormFiltersSelect,
} from '@/app/(dashboard)/_components/form-filters.component';
import { useDataTable } from '@/app/(dashboard)/_providers/data-table-provider';
import type { LogDataDataTableFiltersType } from '@/app/(dashboard)/dashboard/log-data/log-data.definition';
import { capitalizeFirstLetter } from '@/helpers/string.helper';
import { useSearchFilter } from '@/hooks/use-search-filter.hook';
import { useTranslation } from '@/hooks/use-translation.hook';
import {
	LogCategoryEnum,
	type LogDataModel,
	LogLevelEnum,
} from '@/models/log-data.model';

const logLevels = Object.values(LogLevelEnum).map((v) => ({
	label: capitalizeFirstLetter(v),
	value: v,
}));

const logCategories = Object.values(LogCategoryEnum).map((v) => ({
	label: capitalizeFirstLetter(v),
	value: v,
}));

export const DataTableLogDataFilters = (): JSX.Element => {
	const { stateDefault, dataTableStore } = useDataTable<
		'log-data',
		LogDataModel
	>();

	const translationsKeys = useMemo(
		() =>
			[
				'log-data.form_filters.label_global',
				'log-data.form_filters.label_category',
				'log-data.form_filters.label_level',
				'log-data.form_filters.label_created_at',
			] as const,
		[],
	);

	const { translations } = useTranslation(translationsKeys);

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
		initialValue: filters.global?.value ?? '',
		debounceDelay: 1000,
		minLength: 3,
		onSearch: (value) => setFilterValue('global', value),
	});

	useEffect(() => {
		const handleFilterReset = () => {
			updateTableState({
				filters: stateDefault.filters,
			});

			searchGlobal.onReset();
		};

		window.addEventListener(
			'filterReset',
			handleFilterReset as EventListener,
		);

		return () => {
			window.removeEventListener(
				'filterReset',
				handleFilterReset as EventListener,
			);
		};
	}, [
		searchGlobal,
		searchGlobal.onReset,
		stateDefault.filters,
		updateTableState,
	]);

	return (
		<div className="form-section flex-row flex-wrap gap-4 border-b border-line pb-4">
			<FormFiltersSearch<LogDataDataTableFiltersType>
				labelText={translations['log-data.form_filters.label_global']}
				search={searchGlobal}
			/>

			<FormFiltersSelect<LogDataDataTableFiltersType>
				labelText={translations['log-data.form_filters.label_category']}
				fieldName="category"
				fieldValue={filters.category.value}
				options={logCategories}
				onValueChange={(value) =>
					setFilterValue('category', value as LogCategoryEnum)
				}
			/>

			<FormFiltersSelect<LogDataDataTableFiltersType>
				labelText={translations['log-data.form_filters.label_level']}
				fieldName="level"
				fieldValue={filters.level.value}
				options={logLevels}
				onValueChange={(value) =>
					setFilterValue('level', value as LogLevelEnum)
				}
			/>

			<FormFiltersDateRange<LogDataDataTableFiltersType>
				labelText={
					translations['log-data.form_filters.label_created_at']
				}
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

			<FormFiltersReset source="DataTableLogDataFilters" />
		</div>
	);
};
