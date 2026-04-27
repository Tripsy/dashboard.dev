'use client';

import { type JSX, useCallback, useMemo, useState } from 'react';
import { useStore } from 'zustand/react';
import {
	FormFiltersAutoComplete,
	FormFiltersReset,
	FormFiltersSearch,
	FormFiltersSelect,
	FormFiltersShowDeleted,
} from '@/app/(dashboard)/_components/form-filters.component';
import { useDataTable } from '@/app/(dashboard)/_providers/data-table.provider';
import type { VehiclesDataTableFiltersType } from '@/app/(dashboard)/dashboard/vehicles/vehicles.definition';
import { Icons } from '@/components/icon.component';
import { toOptionsFromEnum } from '@/helpers/form.helper';
import { formatEnumLabel } from '@/helpers/string.helper';
import { useDataTableFilterReset } from '@/hooks/use-data-table-filter-reset.hook';
import { useSearchFilter } from '@/hooks/use-search-filter.hook';
import type { BrandModel } from '@/models/brand.model';
import {
	type VehicleModel,
	type VehicleStatus,
	VehicleStatusEnum,
	type VehicleType,
	VehicleTypeEnum,
} from '@/models/vehicle.model';

const statuses = toOptionsFromEnum(VehicleStatusEnum, {
	formatter: formatEnumLabel,
});

const vehicleTypes = toOptionsFromEnum(VehicleTypeEnum, {
	formatter: formatEnumLabel,
});

export const DataTableVehiclesFilters = (): JSX.Element => {
	const { dataSource, dataTableStateDefault, dataTableStore } = useDataTable<
		'vehicles',
		VehicleModel
	>();

	const filters = useStore(
		dataTableStore,
		(state) => state.tableState.filters,
	) as VehiclesDataTableFiltersType;

	const updateTableState = useStore(
		dataTableStore,
		(state) => state.updateTableState,
	);

	const setFilterValues = useCallback(
		(
			updates: Partial<{
				[K in keyof VehiclesDataTableFiltersType]: VehiclesDataTableFiltersType[K]['value'];
			}>,
		) => {
			const updatedFilters = { ...filters };

			function applyUpdate<K extends keyof VehiclesDataTableFiltersType>(
				key: K,
				value: VehiclesDataTableFiltersType[K]['value'],
			): void {
				updatedFilters[key] = {
					...filters[key],
					value,
				};
			}

			for (const key of Object.keys(updates) as Array<
				keyof VehiclesDataTableFiltersType
			>) {
				applyUpdate(
					key,
					updates[
						key
					] as VehiclesDataTableFiltersType[typeof key]['value'],
				);
			}

			updateTableState({ filters: updatedFilters });
		},
		[filters, updateTableState],
	);

	const [searchBrand, setSearchBrand] = useState(filters.brand?.value ?? '');

	const searchGlobal = useSearchFilter({
		initialValue: filters.global.value ?? '',
		debounceDelay: 1000,
		minLength: 3,
		onSearch: (value) => setFilterValues({ global: value }),
	});

	const onResetBrand = useCallback(() => {
		setSearchBrand('');
	}, []);

	const resetCallbacks = useMemo(
		() => [searchGlobal.onReset, onResetBrand],
		[searchGlobal.onReset, onResetBrand],
	);

	useDataTableFilterReset({
		dataSource,
		defaultFilters: dataTableStateDefault.filters,
		updateTableState,
		onReset: resetCallbacks,
	});

	return (
		<div className="form-section flex-row flex-wrap gap-4 border-b border-line pb-4">
			<FormFiltersSearch<VehiclesDataTableFiltersType>
				labelText="ID / Model"
				search={searchGlobal}
			/>

			<FormFiltersAutoComplete<VehiclesDataTableFiltersType, BrandModel>
				labelText="Brand"
				fieldName="brand"
				fieldNameId="brand_id"
				fieldValue={searchBrand}
				className="pl-8"
				icons={{
					left: <Icons.Brand className="opacity-40 h-4.5 w-4.5" />,
				}}
				setFilterValues={setFilterValues}
				setSearch={setSearchBrand}
				dataSourceKey="brands"
				getOptionLabel={(b) => b.name}
				getOptionKey={(b) => b.id}
			/>

			<FormFiltersSelect<VehiclesDataTableFiltersType>
				labelText="Status"
				fieldName="status"
				fieldValue={filters.status.value}
				options={statuses}
				onChange={(value) =>
					setFilterValues({ status: value as VehicleStatus })
				}
			/>

			<FormFiltersSelect<VehiclesDataTableFiltersType>
				labelText="Type"
				fieldName="vehicle_type"
				fieldValue={filters.vehicle_type.value}
				options={vehicleTypes}
				onChange={(value) =>
					setFilterValues({ vehicle_type: value as VehicleType })
				}
			/>

			<FormFiltersShowDeleted
				checked={filters.is_deleted.value ?? false}
				onCheckedChange={(value) =>
					setFilterValues({ is_deleted: value })
				}
			/>

			<FormFiltersReset dataSource="vehicles" />
		</div>
	);
};
