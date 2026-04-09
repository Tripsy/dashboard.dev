'use client';

import { type JSX, useCallback, useEffect } from 'react';
import { useStore } from 'zustand/react';
import {
	FormFiltersReset,
	FormFiltersSearch,
	FormFiltersSelect,
	FormFiltersShowDeleted,
} from '@/app/(dashboard)/_components/form-filters.component';
import { useDataTable } from '@/app/(dashboard)/_providers/data-table.provider';
import type { ClientAddressDataTableFiltersType } from '@/app/(dashboard)/dashboard/client-address/client-address.definition';
import { capitalizeFirstLetter } from '@/helpers/string.helper';
import { useSearchFilter } from '@/hooks/use-search-filter.hook';
import {
	type ClientAddressModel,
	ClientAddressTypeEnum,
} from '@/models/client-address.model';

const addressTypes = Object.values(ClientAddressTypeEnum).map((v) => ({
	label: capitalizeFirstLetter(v),
	value: v,
}));

export const DataTableClientAddressFilters = (): JSX.Element => {
	const { stateDefault, dataTableStore } = useDataTable<
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
				onValueChange={(value) =>
					setFilterValue(
						'address_type',
						value as ClientAddressTypeEnum,
					)
				}
			/>

			<FormFiltersShowDeleted
				checked={filters.is_deleted?.value || false}
				onCheckedChange={(value) => setFilterValue('is_deleted', value)}
			/>

			<FormFiltersReset dataSource="client-address" />
		</div>
	);
};
