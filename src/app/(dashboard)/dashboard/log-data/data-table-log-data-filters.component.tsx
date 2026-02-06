'use client';

import type React from 'react';
import { useCallback, useEffect, useMemo } from 'react';
import { useStore } from 'zustand/react';
import {
	FormFiltersDateRange,
	FormFiltersReset,
	FormFiltersSearch,
	FormFiltersSelect,
} from '@/app/(dashboard)/_components/form-filters.component';
import { useDataTable } from '@/app/(dashboard)/_providers/data-table-provider';
import type { LogDataDataTableFiltersType } from '@/app/(dashboard)/dashboard/log-data/log-data.definition';
import { createFilterHandlers } from '@/helpers/data-table.helper';
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

export const DataTableLogDataFilters = (): React.JSX.Element => {
	const { stateDefault, dataTableStore } = useDataTable<
		'log-data',
		LogDataModel
	>();

	const translationsKeys = useMemo(
		() =>
			[
				'log_data.form_filters.label_global',
				'log_data.form_filters.label_category',
				'log_data.form_filters.label_level',
				'log_data.form_filters.label_created_at',
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

	const updateFilters = useCallback(
		(newFilters: Partial<typeof DataTableLogDataFilters>) => {
			updateTableState({
				filters: { ...filters, ...newFilters },
			});
		},
		[filters, updateTableState],
	);

	const handlers = useMemo(
		() => createFilterHandlers(updateFilters),
		[updateFilters],
	);

	const { handleInputChange, handleSelectChange, handleDateChange } =
		handlers;

	const searchGlobal = useSearchFilter({
		initialValue: filters.global?.value ?? '',
		debounceDelay: 1000,
		minLength: 3,
		onSearch: (value) => {
			handleInputChange('global', value);
		},
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
			<FormFiltersSearch
				labelText={translations['log_data.form_filters.label_global']}
				fieldName="global"
				search={searchGlobal}
			/>

			<FormFiltersSelect
				labelText={translations['log_data.form_filters.label_category']}
				fieldName="category"
				fieldValue={filters.category.value}
				selectOptions={logCategories}
				handleSelectChange={handleSelectChange}
			/>

			<FormFiltersSelect
				labelText={translations['log_data.form_filters.label_level']}
				fieldName="level"
				fieldValue={filters.level.value}
				selectOptions={logLevels}
				handleSelectChange={handleSelectChange}
			/>

			<FormFiltersDateRange
				labelText={
					translations['log_data.form_filters.label_created_at']
				}
				startDateField="create_date_start"
				startDateValue={filters.create_date_start?.value ?? ''}
				endDateField="create_date_end"
				endDateValue={filters.create_date_end?.value ?? ''}
				handleDateChange={handleDateChange}
			/>

			<FormFiltersReset source="DataTableLogDataFilters" />
		</div>
	);
};
