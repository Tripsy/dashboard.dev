'use client';

import { type JSX, useCallback, useMemo, useState } from 'react';
import { useStore } from 'zustand/react';
import {
	FormFiltersAutoComplete,
	FormFiltersReset,
	FormFiltersSearch,
} from '@/app/(dashboard)/_components/form-filters.component';
import { useDataTable } from '@/app/(dashboard)/_providers/data-table.provider';
import type { CmrVehicleDataTableFiltersType } from '@/app/(dashboard)/dashboard/cmr-vehicle/cmr-vehicle.definition';
import { Icons } from '@/components/icon.component';
import { useDataTableFilterReset } from '@/hooks/use-data-table-filter-reset.hook';
import { useSearchFilter } from '@/hooks/use-search-filter.hook';
import type { CmrVehicleModel } from '@/models/cmr-vehicle.model';
import { displayVehicleLabel, type VehicleModel } from '@/models/vehicle.model';

export const DataTableFiltersCmrVehicle = (): JSX.Element => {
	const { dataSource, dataTableStateDefault, dataTableStore } = useDataTable<
		'cmr-vehicle',
		CmrVehicleModel
	>();

	const filters = useStore(
		dataTableStore,
		(state) => state.tableState.filters,
	) as CmrVehicleDataTableFiltersType;

	const updateTableState = useStore(
		dataTableStore,
		(state) => state.updateTableState,
	);

	const setFilterValues = useCallback(
		(
			updates: Partial<{
				[K in keyof CmrVehicleDataTableFiltersType]: CmrVehicleDataTableFiltersType[K]['value'];
			}>,
		) => {
			const updatedFilters = { ...filters };

			function applyUpdate<
				K extends keyof CmrVehicleDataTableFiltersType,
			>(key: K, value: CmrVehicleDataTableFiltersType[K]['value']): void {
				updatedFilters[key] = {
					...filters[key],
					value,
				};
			}

			for (const key of Object.keys(updates) as Array<
				keyof CmrVehicleDataTableFiltersType
			>) {
				applyUpdate(
					key,
					updates[
						key
					] as CmrVehicleDataTableFiltersType[typeof key]['value'],
				);
			}

			updateTableState({ filters: updatedFilters });
		},
		[filters, updateTableState],
	);

	const [searchVehicle, setSearchVehicle] = useState(
		filters.vehicle?.value ?? '',
	);

	const onResetVehicle = useCallback(() => {
		setSearchVehicle('');
	}, []);

	const searchGlobal = useSearchFilter({
		initialValue: filters.global.value ?? '',
		debounceDelay: 1000,
		minLength: 3,
		onSearch: (value) => setFilterValues({ global: value }),
	});

	const searchCmrId = useSearchFilter({
		initialValue: filters.cmr_id.value ?? '',
		debounceDelay: 1000,
		minLength: 1,
		onSearch: (value) => setFilterValues({ cmr_id: value }),
	});

	const resetCallbacks = useMemo(
		() => [searchGlobal.onReset, searchCmrId.onReset, onResetVehicle],
		[searchGlobal.onReset, searchCmrId.onReset, onResetVehicle],
	);

	useDataTableFilterReset({
		dataSource,
		defaultFilters: dataTableStateDefault.filters,
		updateTableState,
		onReset: resetCallbacks,
	});

	return (
		<div className="form-section flex-row flex-wrap gap-4 border-b border-line pb-4">
			<FormFiltersSearch<CmrVehicleDataTableFiltersType>
				labelText="ID / Vin / Plate / Notes"
				search={searchGlobal}
			/>

			<FormFiltersSearch<CmrVehicleDataTableFiltersType>
				labelText="CMR ID"
				fieldName="cmr_id"
				search={searchCmrId}
			/>

			<FormFiltersAutoComplete<
				CmrVehicleDataTableFiltersType,
				VehicleModel
			>
				labelText="Vehicle"
				fieldName="vehicle"
				fieldNameId="vehicle_id"
				fieldValue={searchVehicle}
				className="pl-8"
				icons={{
					left: <Icons.Vehicle className="opacity-40 h-4.5 w-4.5" />,
				}}
				setFilterValues={setFilterValues}
				setSearch={setSearchVehicle}
				dataSourceKey="vehicle"
				getOptionLabel={(m) => displayVehicleLabel(m)}
				getOptionKey={(m) => m.id}
			/>

			<FormFiltersReset dataSource="cmr-vehicle" />
		</div>
	);
};
