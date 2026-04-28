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
import type { CompanyVehiclesDataTableFiltersType } from '@/app/(dashboard)/dashboard/company-vehicles/company-vehicles.definition';
import { toOptionsFromEnum } from '@/helpers/form.helper';
import { formatEnumLabel } from '@/helpers/string.helper';
import { useDataTableFilterReset } from '@/hooks/use-data-table-filter-reset.hook';
import { useSearchFilter } from '@/hooks/use-search-filter.hook';
import {
	type CompanyVehicleModel,
	type CompanyVehicleScope,
	CompanyVehicleScopeEnum,
	type CompanyVehicleStatus,
	CompanyVehicleStatusEnum,
} from '@/models/company-vehicle.model';

const statuses = toOptionsFromEnum(CompanyVehicleStatusEnum, {
	formatter: formatEnumLabel,
});

const scopes = toOptionsFromEnum(CompanyVehicleScopeEnum, {
	formatter: formatEnumLabel,
});

export const DataTableFiltersCompanyVehicles = (): JSX.Element => {
	const { dataSource, dataTableStateDefault, dataTableStore } = useDataTable<
		'company-vehicles',
		CompanyVehicleModel
	>();

	const filters = useStore(
		dataTableStore,
		(state) => state.tableState.filters,
	) as CompanyVehiclesDataTableFiltersType;

	const updateTableState = useStore(
		dataTableStore,
		(state) => state.updateTableState,
	);

	const setFilterValue = useCallback(
		<K extends keyof CompanyVehiclesDataTableFiltersType>(
			key: K,
			value: CompanyVehiclesDataTableFiltersType[K]['value'],
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
			<FormFiltersSearch<CompanyVehiclesDataTableFiltersType>
				labelText="ID / Plate / VIN / Notes"
				search={searchGlobal}
			/>

			<FormFiltersSelect<CompanyVehiclesDataTableFiltersType>
				labelText="Scope"
				fieldName="scope"
				fieldValue={filters.scope.value}
				options={scopes}
				onChange={(value) =>
					setFilterValue('scope', value as CompanyVehicleScope)
				}
			/>

			<FormFiltersSelect<CompanyVehiclesDataTableFiltersType>
				labelText="Status"
				fieldName="status"
				fieldValue={filters.status.value}
				options={statuses}
				onChange={(value) =>
					setFilterValue('status', value as CompanyVehicleStatus)
				}
			/>

			<FormFiltersShowDeleted
				checked={filters.is_deleted.value ?? false}
				onCheckedChange={(value) => setFilterValue('is_deleted', value)}
			/>

			<FormFiltersReset dataSource="company-vehicles" />
		</div>
	);
};
