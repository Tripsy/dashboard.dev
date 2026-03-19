'use client';

import { type JSX, useCallback, useEffect } from 'react';
import { useStore } from 'zustand/react';
import {
	FormFiltersDateRange,
	FormFiltersReset,
	FormFiltersSearch,
	FormFiltersSelect,
} from '@/app/(dashboard)/_components/form-filters.component';
import { useDataTable } from '@/app/(dashboard)/_providers/data-table-provider';
import type { ClientsDataTableFiltersType } from '@/app/(dashboard)/dashboard/clients/clients.definition';
import { capitalizeFirstLetter } from '@/helpers/string.helper';
import { useSearchFilter } from '@/hooks/use-search-filter.hook';
import {
	type ClientModel,
	ClientStatusEnum,
	ClientTypeEnum,
} from '@/models/client.model';

const statuses = Object.values(ClientStatusEnum).map((v) => ({
	label: capitalizeFirstLetter(v),
	value: v,
}));

const clientTypes = Object.values(ClientTypeEnum).map((v) => ({
	label: capitalizeFirstLetter(v),
	value: v,
}));

export const DataTableClientsFilters = (): JSX.Element => {
	const { stateDefault, dataTableStore } = useDataTable<
		'clients',
		ClientModel
	>();

	const filters = useStore(
		dataTableStore,
		(state) => state.tableState.filters,
	) as ClientsDataTableFiltersType;

	const updateTableState = useStore(
		dataTableStore,
		(state) => state.updateTableState,
	);

	const setFilterValue = useCallback(
		<K extends keyof ClientsDataTableFiltersType>(
			key: K,
			value: ClientsDataTableFiltersType[K]['value'],
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
	}, [searchGlobal, stateDefault.filters, updateTableState]);

	return (
		<div className="form-section flex-row flex-wrap gap-4 border-b border-line pb-4">
			<FormFiltersSearch<ClientsDataTableFiltersType>
				labelText="ID / Name / CUI / CNP"
				search={searchGlobal}
			/>

			<FormFiltersSelect<ClientsDataTableFiltersType>
				labelText="Status"
				fieldName="status"
				fieldValue={filters.status.value}
				options={statuses}
				onValueChange={(value) =>
					setFilterValue('status', value as ClientStatusEnum)
				}
			/>

			<FormFiltersSelect<ClientsDataTableFiltersType>
				labelText="Type"
				fieldName="client_type"
				fieldValue={filters.client_type.value}
				options={clientTypes}
				onValueChange={(value) =>
					setFilterValue('client_type', value as ClientTypeEnum)
				}
			/>

			<FormFiltersDateRange<ClientsDataTableFiltersType>
				labelText="Create Date"
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

			<FormFiltersReset source="DataTableClientsFilters" />
		</div>
	);
};
