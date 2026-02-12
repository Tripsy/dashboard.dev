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
import type { LogHistoryDataTableFiltersType } from '@/app/(dashboard)/dashboard/log-history/log-history.definition';
import { capitalizeFirstLetter, toTitleCase } from '@/helpers/string.helper';
import { useSearchFilter } from '@/hooks/use-search-filter.hook';
import { useTranslation } from '@/hooks/use-translation.hook';
import {
	LogHistoryActions,
	LogHistoryEntities,
	type LogHistoryModel,
	LogHistorySource,
} from '@/models/log-history.model';

const entities = LogHistoryEntities.map((v) => ({
	label: toTitleCase(v),
	value: v,
}));

const actions = LogHistoryActions.map((v) => ({
	label: capitalizeFirstLetter(v),
	value: v,
}));

const sources = Object.values(LogHistorySource).map((v) => ({
	label: capitalizeFirstLetter(v),
	value: v,
}));

export const DataTableLogHistoryFilters = (): JSX.Element => {
	const { stateDefault, dataTableStore } = useDataTable<
		'log-history',
		LogHistoryModel
	>();

	const translationsKeys = useMemo(
		() =>
			[
				'log_history.form_filters.label_request_id',
				'log_history.form_filters.label_entity',
				'log_history.form_filters.label_entity_id',
				'log_history.form_filters.label_action',
				'log_history.form_filters.label_source',
				'log_history.form_filters.label_recorded_at',
			] as const,
		[],
	);

	const { translations } = useTranslation(translationsKeys);

	const filters = useStore(
		dataTableStore,
		(state) => state.tableState.filters,
	) as LogHistoryDataTableFiltersType;

	const updateTableState = useStore(
		dataTableStore,
		(state) => state.updateTableState,
	);

	const setFilterValue = useCallback(
		<K extends keyof LogHistoryDataTableFiltersType>(
			key: K,
			value: LogHistoryDataTableFiltersType[K]['value'],
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

	const searchRequestId = useSearchFilter({
		initialValue: filters.request_id?.value ?? '',
		debounceDelay: 1000,
		minLength: 36,
		onSearch: (value) => setFilterValue('request_id', value),
	});

	const searchEntityId = useSearchFilter({
		initialValue: filters.entity_id?.value ?? '',
		debounceDelay: 1000,
		minLength: 2,
		onSearch: (value) => setFilterValue('entity_id', value),
	});

	useEffect(() => {
		const handleFilterReset = () => {
			updateTableState({
				filters: stateDefault.filters,
			});

			searchRequestId.onReset();
			searchEntityId.onReset();
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
		searchRequestId,
		searchRequestId.onReset,
		searchEntityId,
		searchEntityId.onReset,
		stateDefault.filters,
		updateTableState,
	]);

	return (
		<div className="form-section flex-row flex-wrap gap-4 border-b border-line pb-4">
			<FormFiltersSearch<LogHistoryDataTableFiltersType>
				labelText={
					translations['log_history.form_filters.label_request_id']
				}
				fieldName="request_id"
				search={searchRequestId}
			/>

			<FormFiltersSelect<LogHistoryDataTableFiltersType>
				labelText={translations['log_history.form_filters.label_entity']}
				fieldName="entity"
				fieldValue={filters.entity.value}
				options={entities}
				onValueChange={(value) =>
					setFilterValue('entity', value)
				}
			/>

			<FormFiltersSearch<LogHistoryDataTableFiltersType>
				labelText={
					translations['log_history.form_filters.label_entity_id']
				}
				fieldName="entity_id"
				search={searchEntityId}
			/>

			<FormFiltersSelect<LogHistoryDataTableFiltersType>
				labelText={translations['log_history.form_filters.label_action']}
				fieldName="action"
				fieldValue={filters.action.value}
				options={actions}
				onValueChange={(value) =>
					setFilterValue('action', value)
				}
			/>

			<FormFiltersSelect<LogHistoryDataTableFiltersType>
				labelText={translations['log_history.form_filters.label_source']}
				fieldName="source"
				fieldValue={filters.source.value}
				options={sources}
				onValueChange={(value) =>
					setFilterValue('source', value as LogHistorySource)
				}
			/>

			<FormFiltersDateRange<LogHistoryDataTableFiltersType>
				labelText={translations['log_history.form_filters.label_recorded_at']}
				start={{
					fieldName: 'recorded_at_start',
					fieldValue: filters.recorded_at_start.value,
					onSelect: (value) =>
						setFilterValue('recorded_at_start', value),
				}}
				end={{
					fieldName: 'recorded_at_end',
					fieldValue: filters.recorded_at_end.value,
					onSelect: (value) =>
						setFilterValue('recorded_at_end', value),
				}}
			/>

			<FormFiltersReset source="DataTableLogHistoryFilters" />
		</div>
	);
};
