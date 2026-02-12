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
import type { MailQueueDataTableFiltersType } from '@/app/(dashboard)/dashboard/mail-queue/mail-queue.definition';
import { capitalizeFirstLetter } from '@/helpers/string.helper';
import { useSearchFilter } from '@/hooks/use-search-filter.hook';
import { useTranslation } from '@/hooks/use-translation.hook';
import {
	type MailQueueModel,
	MailQueueStatusEnum,
} from '@/models/mail-queue.model';
import type {UsersDataTableFiltersType} from "@/app/(dashboard)/dashboard/users/users.definition";
import {UserRoleEnum} from "@/models/user.model";

const statuses = Object.values(MailQueueStatusEnum).map((v) => ({
	label: capitalizeFirstLetter(v),
	value: v,
}));

export const DataTableMailQueueFilters = (): JSX.Element => {
	const { stateDefault, dataTableStore } = useDataTable<
		'mail-queue',
		MailQueueModel
	>();

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

	const filters = useStore(
		dataTableStore,
		(state) => state.tableState.filters,
	) as MailQueueDataTableFiltersType;

	const updateTableState = useStore(
		dataTableStore,
		(state) => state.updateTableState,
	);

	const setFilterValue = useCallback(
		<K extends keyof MailQueueDataTableFiltersType>(
			key: K,
			value: MailQueueDataTableFiltersType[K]['value'],
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

	const searchTemplate = useSearchFilter({
		initialValue: filters.template?.value ?? '',
		debounceDelay: 1000,
		minLength: 1,
		onSearch: (value) => setFilterValue('template', value),
	});

	const searchContent = useSearchFilter({
		initialValue: filters.content?.value ?? '',
		debounceDelay: 1000,
		minLength: 3,
		onSearch: (value) => setFilterValue('content', value),
	});

	const searchTo = useSearchFilter({
		initialValue: filters.to?.value ?? '',
		debounceDelay: 1000,
		minLength: 3,
		onSearch: (value) => setFilterValue('to', value),
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
			<FormFiltersDateRange<MailQueueDataTableFiltersType>
				labelText={translations['mail_queue.form_filters.label_sent_date_start']}
				start={{
					fieldName: 'sent_date_start',
					fieldValue: filters.sent_date_start.value,
					onSelect: (value) =>
						setFilterValue('sent_date_start', value),
				}}
				end={{
					fieldName: 'sent_date_end',
					fieldValue: filters.sent_date_end.value,
					onSelect: (value) =>
						setFilterValue('sent_date_end', value),
				}}
			/>

			<FormFiltersSelect<MailQueueDataTableFiltersType>
				labelText={translations['mail_queue.form_filters.label_status']}
				fieldName="status"
				fieldValue={filters.status.value}
				options={statuses}
				onValueChange={(value) =>
					setFilterValue('status', value as MailQueueStatusEnum)
				}
			/>

			<FormFiltersSearch<MailQueueDataTableFiltersType>
				labelText={translations['mail_queue.form_filters.label_template']}
				fieldName="template"
				search={searchTemplate}
			/>

			<FormFiltersSearch<MailQueueDataTableFiltersType>
				labelText={translations['mail_queue.form_filters.label_content']}
				fieldName="content"
				search={searchContent}
			/>

			<FormFiltersSearch<MailQueueDataTableFiltersType>
				labelText={translations['mail_queue.form_filters.label_to']}
				fieldName="to"
				search={searchTo}
			/>

			<FormFiltersReset source="DataTableMailQueueFilters" />
		</div>
	);
};
