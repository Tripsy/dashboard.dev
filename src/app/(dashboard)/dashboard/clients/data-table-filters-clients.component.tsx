'use client';

import { type JSX, useCallback, useMemo } from 'react';
import { useStore } from 'zustand/react';
import {
	FormFiltersDateRange,
	FormFiltersReset,
	FormFiltersSearch,
	FormFiltersSelect,
	FormFiltersShowDeleted,
} from '@/app/(dashboard)/_components/form-filters.component';
import { useDataTable } from '@/app/(dashboard)/_providers/data-table.provider';
import type { ClientsDataTableFiltersType } from '@/app/(dashboard)/dashboard/clients/clients.definition';
import { toOptionsFromEnum } from '@/helpers/form.helper';
import { formatEnumLabel } from '@/helpers/string.helper';
import { useDataTableFilterReset } from '@/hooks/use-data-table-filter-reset.hook';
import { useSearchFilter } from '@/hooks/use-search-filter.hook';
import {
	type ClientModel,
	type ClientStatus,
	ClientStatusEnum,
	type ClientType,
	ClientTypeEnum,
} from '@/models/client.model';

const statuses = toOptionsFromEnum(ClientStatusEnum, {
	formatter: formatEnumLabel,
});

const clientTypes = toOptionsFromEnum(ClientTypeEnum, {
	formatter: formatEnumLabel,
});

export const DataTableFiltersClients = (): JSX.Element => {
	const { dataSource, dataTableStateDefault, dataTableStore } = useDataTable<
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
			<FormFiltersSearch<ClientsDataTableFiltersType>
				labelText="ID / Name / CUI / CNP"
				search={searchGlobal}
			/>

			<FormFiltersSelect<ClientsDataTableFiltersType>
				labelText="Status"
				fieldName="status"
				fieldValue={filters.status.value}
				options={statuses}
				onChange={(value) =>
					setFilterValue('status', value as ClientStatus)
				}
			/>

			<FormFiltersSelect<ClientsDataTableFiltersType>
				labelText="Type"
				fieldName="client_type"
				fieldValue={filters.client_type.value}
				options={clientTypes}
				onChange={(value) =>
					setFilterValue('client_type', value as ClientType)
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

			<FormFiltersShowDeleted
				checked={filters.is_deleted.value ?? false}
				onCheckedChange={(value) => setFilterValue('is_deleted', value)}
			/>

			<FormFiltersReset dataSource="clients" />
		</div>
	);
};
