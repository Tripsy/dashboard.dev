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
import type { CronHistoryDataTableFiltersType } from '@/app/(dashboard)/dashboard/cron-history/cron-history.definition';
import { createFilterHandlers } from '@/helpers/data-table.helper';
import { capitalizeFirstLetter } from '@/helpers/string.helper';
import { useSearchFilter } from '@/hooks/use-search-filter.hook';
import { useTranslation } from '@/hooks/use-translation.hook';
import {
	type CronHistoryModel,
	CronHistoryStatusEnum,
} from '@/models/cron-history.model';

const statuses = Object.values(CronHistoryStatusEnum).map((v) => ({
	label: capitalizeFirstLetter(v),
	value: v,
}));

export const DataTableCronHistoryFilters = (): React.JSX.Element => {
	const { stateDefault, dataTableStore } = useDataTable<
		'cron-history',
		CronHistoryModel
	>();

	const translationsKeys = useMemo(
		() =>
			[
				'cron_history.form_filters.label_global',
				'cron_history.form_filters.label_status',
				'cron_history.form_filters.label_start_date',
			] as const,
		[],
	);

	const { translations } = useTranslation(translationsKeys);

	const filters = useStore(
		dataTableStore,
		(state) => state.tableState.filters,
	) as CronHistoryDataTableFiltersType;

	const updateTableState = useStore(
		dataTableStore,
		(state) => state.updateTableState,
	);

	const updateFilters = useCallback(
		(newFilters: Partial<typeof DataTableCronHistoryFilters>) => {
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
				labelText={
					translations['cron_history.form_filters.label_global']
				}
				fieldName="global"
				search={searchGlobal}
			/>

			<FormFiltersSelect
				labelText={
					translations['cron_history.form_filters.label_status']
				}
				fieldName="status"
				fieldValue={filters.status.value}
				selectOptions={statuses}
				handleSelectChange={handleSelectChange}
			/>

			<FormFiltersDateRange
				labelText={
					translations['cron_history.form_filters.label_start_date']
				}
				startDateField="start_date_start"
				startDateValue={filters.start_date_start?.value ?? ''}
				endDateField="start_date_end"
				endDateValue={filters.start_date_end?.value ?? ''}
				handleDateChange={handleDateChange}
			/>

			<FormFiltersReset source="DataTableCronHistoryFilters" />
		</div>
	);
};
