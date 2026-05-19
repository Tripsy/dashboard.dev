'use client';

import { type JSX, useCallback, useMemo, useState } from 'react';
import { useStore } from 'zustand/react';
import {
	FormFiltersAutoComplete,
	FormFiltersReset,
	FormFiltersSelect,
} from '@/app/(dashboard)/_components/form-filters.component';
import { useDataTable } from '@/app/(dashboard)/_providers/data-table.provider';
import type { OperationalRecordDataTableFiltersType } from '@/app/(dashboard)/dashboard/operational-record/operational-record.definition';
import { Icons } from '@/components/icon.component';
import { toOptionsFromEnum } from '@/helpers/form.helper';
import { formatEnumLabel } from '@/helpers/string.helper';
import { useDataTableFilterReset } from '@/hooks/use-data-table-filter-reset.hook';
import { CashFlowStatusEnum } from '@/models/cash-flow.model';
import {
	type CompanyVehicleModel,
	displayCompanyVehicleLabel,
} from '@/models/company-vehicle.model';
import type { OperationalRecordModel } from '@/models/operational-record.model';

const cashFlowStatuses = toOptionsFromEnum(CashFlowStatusEnum, {
	formatter: formatEnumLabel,
});

export const DataTableFiltersOperationalRecord = (): JSX.Element => {
	const { dataSource, dataTableStateDefault, dataTableStore } = useDataTable<
		'operational-record',
		OperationalRecordModel
	>();

	const filters = useStore(
		dataTableStore,
		(state) => state.tableState.filters,
	) as OperationalRecordDataTableFiltersType;

	const updateTableState = useStore(
		dataTableStore,
		(state) => state.updateTableState,
	);

	const setFilterValues = useCallback(
		(
			updates: Partial<{
				[K in keyof OperationalRecordDataTableFiltersType]: OperationalRecordDataTableFiltersType[K]['value'];
			}>,
		) => {
			const updatedFilters = { ...filters };

			function applyUpdate<
				K extends keyof OperationalRecordDataTableFiltersType,
			>(
				key: K,
				value: OperationalRecordDataTableFiltersType[K]['value'],
			): void {
				updatedFilters[key] = {
					...filters[key],
					value,
				};
			}

			for (const key of Object.keys(updates) as Array<
				keyof OperationalRecordDataTableFiltersType
			>) {
				applyUpdate(
					key,
					updates[
						key
					] as OperationalRecordDataTableFiltersType[typeof key]['value'],
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
				OperationalRecordDataTableFiltersType,
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
				dataSourceKey="company-vehicle"
				getOptionLabel={(m) => displayCompanyVehicleLabel(m)}
				getOptionKey={(m) => m.id}
			/>

			<FormFiltersSelect<OperationalRecordDataTableFiltersType>
				labelText="Session Status"
				fieldName="status"
				fieldValue={filters.work_session_status.value}
				options={workSessionStatuses}
				onChange={(value) =>
					setFilterValues({
						work_session_status: value as OperationalRecordStatus,
					})
				}
			/>

			<FormFiltersSelect<OperationalRecordDataTableFiltersType>
				labelText="Vehicle Status"
				fieldName="status"
				fieldValue={filters.status.value}
				options={statuses}
				onChange={(value) =>
					setFilterValues({
						status: value as OperationalRecordStatus,
					})
				}
			/>

			<FormFiltersReset dataSource="operational-record" />
		</div>
	);
};
