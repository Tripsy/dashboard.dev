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
import { MailQueueStatusEnum } from '@/entities/mail-queue.model';
import { createFilterHandlers } from '@/helpers/data-table.helper';
import { capitalizeFirstLetter } from '@/helpers/string.helper';
import { useSearchFilter, useTranslation } from '@/hooks';

const statuses = Object.values(MailQueueStatusEnum).map((v) => ({
	label: capitalizeFirstLetter(v),
	value: v,
}));

export const DataTableMailQueueFilters = (): React.JSX.Element => {
	const { stateDefault, modelStore } = useDataTable<'mail_queue'>();

	const translationsKeys = useMemo(
		() =>
			[
				'mail_queue.form_filters.label_sent_date_start',
				'mail_queue.form_filters.label_status',
				'mail_queue.form_filters.label_template',
				'mail_queue.form_filters.label_content',
				'mail_queue.form_filters.label_to',
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
		(newFilters: Partial<typeof DataTableMailQueueFilters>) => {
			updateTableState({
				filters: { ...filters, ...newFilters },
			});
		},
		[filters, updateTableState],
	);

	const handlers = useMemo(
		() => createFilterHandlers<'mail_queue'>(updateFilters),
		[updateFilters],
	);

	const { handleInputChange, handleSelectChange, handleDateChange } =
		handlers;

	const searchTemplate = useSearchFilter({
		initialValue: filters.template?.value ?? '',
		debounceDelay: 1000,
		minLength: 1,
		onSearch: (value) => {
			handleInputChange('template', value);
		},
	});

	const searchContent = useSearchFilter({
		initialValue: filters.content?.value ?? '',
		debounceDelay: 1000,
		minLength: 3,
		onSearch: (value) => {
			handleInputChange('content', value);
		},
	});

	const searchTo = useSearchFilter({
		initialValue: filters.to?.value ?? '',
		debounceDelay: 1000,
		minLength: 3,
		onSearch: (value) => {
			handleInputChange('to', value);
		},
	});

	useEffect(() => {
		const handleFilterReset = () => {
			updateTableState({
				filters: stateDefault.filters,
			});

			searchTemplate.onReset();
			searchContent.onReset();
			searchTo.onReset();
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
		searchContent,
		searchTemplate,
		searchTo,
		stateDefault.filters,
		updateTableState,
	]);

	return (
		<div className="form-section flex-row flex-wrap gap-4 border-b border-line pb-4">
			<FormFiltersDateRange
				labelText={
					translations[
						'mail_queue.form_filters.label_sent_date_start'
					]
				}
				startDateField="sent_date_start"
				startDateValue={filters.sent_date_start?.value ?? ''}
				endDateField="sent_date_end"
				endDateValue={filters.sent_date_end?.value ?? ''}
				handleDateChange={handleDateChange}
			/>

			<FormFiltersSelect
				labelText={translations['mail_queue.form_filters.label_status']}
				fieldName="status"
				fieldValue={filters.status.value}
				selectOptions={statuses}
				handleSelectChange={handleSelectChange}
			/>

			<FormFiltersSearch
				labelText={
					translations['mail_queue.form_filters.label_template']
				}
				fieldName="template"
				search={searchTemplate}
			/>

			<FormFiltersSearch
				labelText={
					translations['mail_queue.form_filters.label_content']
				}
				fieldName="content"
				search={searchContent}
			/>

			<FormFiltersSearch
				labelText={translations['mail_queue.form_filters.label_to']}
				fieldName="to"
				search={searchTo}
			/>

			<FormFiltersReset source="DataTableMailQueueFilters" />
		</div>
	);
};
