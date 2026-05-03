'use client';

import { type JSX, useCallback, useMemo, useState } from 'react';
import { useStore } from 'zustand/react';
import {
	FormFiltersAutoComplete,
	FormFiltersReset,
	FormFiltersSelect,
} from '@/app/(dashboard)/_components/form-filters.component';
import { useDataTable } from '@/app/(dashboard)/_providers/data-table.provider';
import type { WorkSessionVehiclesDataTableFiltersType } from '@/app/(dashboard)/dashboard/work-session-vehicles/work-session-vehicles.definition';
import { Icons } from '@/components/icon.component';
import { toOptionsFromEnum } from '@/helpers/form.helper';
import { formatEnumLabel } from '@/helpers/string.helper';
import { useDataTableFilterReset } from '@/hooks/use-data-table-filter-reset.hook';
import {
	type CompanyVehicleModel,
	getCompanyVehicleDisplayName,
} from '@/models/company-vehicle.model';
import {
	type WorkSessionStatus,
	WorkSessionStatusEnum,
} from '@/models/work-session.model';
import {
	type WorkSessionVehicleModel,
	type WorkSessionVehicleStatus,
	WorkSessionVehicleStatusEnum,
} from '@/models/work-session-vehicle.model';

const workSessionStatuses = toOptionsFromEnum(WorkSessionStatusEnum, {
	formatter: formatEnumLabel,
});
const statuses = toOptionsFromEnum(WorkSessionVehicleStatusEnum, {
	formatter: formatEnumLabel,
});

export const DataTableFiltersWorkSessionVehicles = (): JSX.Element => {
	const { dataSource, dataTableStateDefault, dataTableStore } = useDataTable<
		'work-session-vehicles',
		WorkSessionVehicleModel
	>();

	const filters = useStore(
		dataTableStore,
		(state) => state.tableState.filters,
	) as WorkSessionVehiclesDataTableFiltersType;

	const updateTableState = useStore(
		dataTableStore,
		(state) => state.updateTableState,
	);

	const setFilterValues = useCallback(
		(
			updates: Partial<{
				[K in keyof WorkSessionVehiclesDataTableFiltersType]: WorkSessionVehiclesDataTableFiltersType[K]['value'];
			}>,
		) => {
			const updatedFilters = { ...filters };

			function applyUpdate<
				K extends keyof WorkSessionVehiclesDataTableFiltersType,
			>(
				key: K,
				value: WorkSessionVehiclesDataTableFiltersType[K]['value'],
			): void {
				updatedFilters[key] = {
					...filters[key],
					value,
				};
			}

			for (const key of Object.keys(updates) as Array<
				keyof WorkSessionVehiclesDataTableFiltersType
			>) {
				applyUpdate(
					key,
					updates[
						key
					] as WorkSessionVehiclesDataTableFiltersType[typeof key]['value'],
				);
			}

			updateTableState({ filters: updatedFilters });
		},
		[filters, updateTableState],
	);

	const [searchCompanyVehicle, setSearchCompanyVehicle] = useState(
		filters.company_vehicle?.value ?? '',
	);

	const onResetCompanyVehicle = useCallback(() => {
		setSearchCompanyVehicle('');
	}, []);

	const resetCallbacks = useMemo(
		() => [onResetCompanyVehicle],
		[onResetCompanyVehicle],
	);

	useDataTableFilterReset({
		dataSource,
		defaultFilters: dataTableStateDefault.filters,
		updateTableState,
		onReset: resetCallbacks,
	});

	return (
		<div className="form-section flex-row flex-wrap gap-4 border-b border-line pb-4">
			<FormFiltersAutoComplete<
				WorkSessionVehiclesDataTableFiltersType,
				CompanyVehicleModel
			>
				labelText="Vehicle"
				fieldName="company_vehicle"
				fieldNameId="company_vehicle_id"
				fieldValue={searchCompanyVehicle}
				className="pl-8"
				icons={{
					left: (
						<Icons.CompanyVehicle className="opacity-40 h-4.5 w-4.5" />
					),
				}}
				setFilterValues={setFilterValues}
				setSearch={setSearchCompanyVehicle}
				dataSourceKey="company-vehicles"
				getOptionLabel={(m) => getCompanyVehicleDisplayName(m)}
				getOptionKey={(m) => m.id}
			/>

			<FormFiltersSelect<WorkSessionVehiclesDataTableFiltersType>
				labelText="Session Status"
				fieldName="status"
				fieldValue={filters.work_session_status.value}
				options={workSessionStatuses}
				onChange={(value) =>
					setFilterValues({
						work_session_status: value as WorkSessionStatus,
					})
				}
			/>

			<FormFiltersSelect<WorkSessionVehiclesDataTableFiltersType>
				labelText="Vehicle Status"
				fieldName="status"
				fieldValue={filters.status.value}
				options={statuses}
				onChange={(value) =>
					setFilterValues({
						status: value as WorkSessionVehicleStatus,
					})
				}
			/>

			<FormFiltersReset dataSource="work-session-vehicles" />
		</div>
	);
};
