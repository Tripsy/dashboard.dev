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
import type { CronHistoryDataTableFiltersType } from '@/app/(dashboard)/dashboard/cron-history/cron-history.definition';
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

export const DataTableCronHistoryFilters = (): JSX.Element => {
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

	const setFilterValue = useCallback(
		<K extends keyof CronHistoryDataTableFiltersType>(
			key: K,
			value: CronHistoryDataTableFiltersType[K]['value'],
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
			<FormFiltersSearch<CronHistoryDataTableFiltersType>
				labelText={
					translations['cron_history.form_filters.label_global']
				}
				fieldName="global"
				search={searchGlobal}
			/>

			<FormFiltersSelect<CronHistoryDataTableFiltersType>
				labelText={
					translations['cron_history.form_filters.label_status']
				}
				fieldName="status"
				fieldValue={filters.status.value}
				options={statuses}
				onValueChange={(value) =>
					setFilterValue('status', value as CronHistoryStatusEnum)
				}
			/>

			<FormFiltersDateRange<CronHistoryDataTableFiltersType>
				labelText={
					translations['cron_history.form_filters.label_start_date']
				}
				start={{
					fieldName: 'start_date_start',
					fieldValue: filters.start_date_start.value,
					onSelect: (value) =>
						setFilterValue('start_date_start', value),
				}}
				end={{
					fieldName: 'start_date_end',
					fieldValue: filters.start_date_end.value,
					onSelect: (value) =>
						setFilterValue('start_date_end', value),
				}}
			/>

			<FormFiltersReset source="DataTableCronHistoryFilters" />
		</div>
	);
};
