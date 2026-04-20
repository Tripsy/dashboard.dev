'use client';

import { type JSX, useCallback, useMemo } from 'react';
import { useStore } from 'zustand/react';
import {
	FormFiltersReset,
	FormFiltersSearch,
	FormFiltersSelect,
	FormFiltersShowDeleted,
} from '@/app/(dashboard)/_components/form-filters.component';
import { useDataTable } from '@/app/(dashboard)/_providers/data-table.provider';
import type { ClientAddressDataTableFiltersType } from '@/app/(dashboard)/dashboard/client-address/client-address.definition';
import { toOptionsFromEnum } from '@/helpers/form.helper';
import { formatEnumLabel } from '@/helpers/string.helper';
import { useDataTableFilterReset } from '@/hooks/use-data-table-filter-reset.hook';
import { useSearchFilter } from '@/hooks/use-search-filter.hook';
import {
	type ClientAddressModel,
	type ClientAddressType,
	ClientAddressTypeEnum,
} from '@/models/client-address.model';

const addressTypes = toOptionsFromEnum(ClientAddressTypeEnum, {
	formatter: formatEnumLabel,
});

export const DataTableClientAddressFilters = (): JSX.Element => {
	const { dataSource, dataTableStateDefault, dataTableStore } = useDataTable<
		'client-address',
		ClientAddressModel
	>();

	const filters = useStore(
		dataTableStore,
		(state) => state.tableState.filters,
	) as ClientAddressDataTableFiltersType;

	const updateTableState = useStore(
		dataTableStore,
		(state) => state.updateTableState,
	);

	const setFilterValue = useCallback(
		<K extends keyof ClientAddressDataTableFiltersType>(
			key: K,
			value: ClientAddressDataTableFiltersType[K]['value'],
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
			<FormFiltersSearch<ClientAddressDataTableFiltersType>
				labelText="ID / Address / Postal Code"
				search={searchGlobal}
			/>

			{/*TODO ADD CLIENT*/}

			<FormFiltersSelect<ClientAddressDataTableFiltersType>
				labelText="Address Type"
				fieldName="address_type"
				fieldValue={filters.address_type.value}
				options={addressTypes}
				onChange={(value) =>
					setFilterValue('address_type', value as ClientAddressType)
				}
			/>

			<FormFiltersShowDeleted
				checked={filters.is_deleted.value ?? false}
				onCheckedChange={(value) => setFilterValue('is_deleted', value)}
			/>

			<FormFiltersReset dataSource="client-address" />
		</div>
	);
};
