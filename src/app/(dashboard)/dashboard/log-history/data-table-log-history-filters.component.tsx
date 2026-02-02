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
import {
	LogHistoryActions,
	LogHistoryEntities,
	LogHistorySource,
} from '@/entities/log-history.model';
import { createFilterHandlers } from '@/helpers/data-table.helper';
import { capitalizeFirstLetter, toTitleCase } from '@/helpers/string.helper';
import { useSearchFilter, useTranslation } from '@/hooks';

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

export const DataTableLogHistoryFilters = (): React.JSX.Element => {
	const { stateDefault, modelStore } = useDataTable<'log_history'>();

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

	const filters = useStore(modelStore, (state) => state.tableState.filters);
	const updateTableState = useStore(
		modelStore,
		(state) => state.updateTableState,
	);

	const updateFilters = useCallback(
		(newFilters: Partial<typeof DataTableLogHistoryFilters>) => {
			updateTableState({
				filters: { ...filters, ...newFilters },
			});
		},
		[filters, updateTableState],
	);

	const handlers = useMemo(
		() => createFilterHandlers<'log_history'>(updateFilters),
		[updateFilters],
	);

	const { handleInputChange, handleSelectChange, handleDateChange } =
		handlers;

	const searchRequestId = useSearchFilter({
		initialValue: filters.request_id?.value ?? '',
		debounceDelay: 1000,
		minLength: 36,
		onSearch: (value) => {
			handleInputChange('request_id', value);
		},
	});

	const searchEntityId = useSearchFilter({
		initialValue: filters.entity_id?.value ?? '',
		debounceDelay: 1000,
		minLength: 2,
		onSearch: (value) => {
			handleInputChange('entity_id', value);
		},
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
			<FormFiltersSearch
				labelText={
					translations['log_history.form_filters.label_request_id']
				}
				fieldName="request_id"
				search={searchRequestId}
			/>

			<FormFiltersSelect
				labelText={
					translations['log_history.form_filters.label_entity']
				}
				fieldName="entity"
				fieldValue={filters.entity.value}
				selectOptions={entities}
				handleSelectChange={handleSelectChange}
			/>

			<FormFiltersSearch
				labelText={
					translations['log_history.form_filters.label_entity_id']
				}
				fieldName="entity_id"
				search={searchEntityId}
			/>

			<FormFiltersSelect
				labelText={
					translations['log_history.form_filters.label_action']
				}
				fieldName="action"
				fieldValue={filters.action.value}
				selectOptions={actions}
				handleSelectChange={handleSelectChange}
			/>

			<FormFiltersSelect
				labelText={
					translations['log_history.form_filters.label_source']
				}
				fieldName="source"
				fieldValue={filters.source.value}
				selectOptions={sources}
				handleSelectChange={handleSelectChange}
			/>

			<FormFiltersDateRange
				labelText={
					translations['log_history.form_filters.label_recorded_at']
				}
				startDateField="recorded_at_start"
				startDateValue={filters.recorded_at_start?.value ?? ''}
				endDateField="recorded_at_end"
				endDateValue={filters.recorded_at_end?.value ?? ''}
				handleDateChange={handleDateChange}
			/>

			<FormFiltersReset source="DataTableLogHistoryFilters" />
		</div>
	);
};
