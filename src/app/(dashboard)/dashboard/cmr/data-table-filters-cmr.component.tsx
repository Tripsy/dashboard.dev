'use client';

import { type JSX, useCallback, useMemo, useState } from 'react';
import { useStore } from 'zustand/react';
import {
	FormFiltersAutoComplete,
	FormFiltersDateRange,
	FormFiltersReset,
	FormFiltersSelect,
	FormFiltersShowDeleted,
} from '@/app/(dashboard)/_components/form-filters.component';
import { useDataTable } from '@/app/(dashboard)/_providers/data-table.provider';
import type { CmrDataTableFiltersType } from '@/app/(dashboard)/dashboard/cmr/cmr.definition';
import { Icons } from '@/components/icon.component';
import { toOptionsFromEnum } from '@/helpers/form.helper';
import { formatEnumLabel } from '@/helpers/string.helper';
import { useDataTableFilterReset } from '@/hooks/use-data-table-filter-reset.hook';
import { type ClientModel, displayClientLabel } from '@/models/client.model';
import {
	type CmrModel,
	type CmrStatus,
	CmrStatusEnum,
	type CmrTransportType,
	CmrTransportTypeEnum,
} from '@/models/cmr.model';

const statuses = toOptionsFromEnum(CmrStatusEnum, {
	formatter: formatEnumLabel,
});

const transportTypes = toOptionsFromEnum(CmrTransportTypeEnum, {
	formatter: formatEnumLabel,
});

export const DataTableFiltersCmr = (): JSX.Element => {
	const { dataSource, dataTableStateDefault, dataTableStore } = useDataTable<
		'cmr',
		CmrModel
	>();

	const filters = useStore(
		dataTableStore,
		(state) => state.tableState.filters,
	) as CmrDataTableFiltersType;

	const updateTableState = useStore(
		dataTableStore,
		(state) => state.updateTableState,
	);

	const setFilterValues = useCallback(
		(
			updates: Partial<{
				[K in keyof CmrDataTableFiltersType]: CmrDataTableFiltersType[K]['value'];
			}>,
		) => {
			const updatedFilters = { ...filters };

			function applyUpdate<K extends keyof CmrDataTableFiltersType>(
				key: K,
				value: CmrDataTableFiltersType[K]['value'],
			): void {
				updatedFilters[key] = {
					...filters[key],
					value,
				};
			}

			for (const key of Object.keys(updates) as Array<
				keyof CmrDataTableFiltersType
			>) {
				applyUpdate(
					key,
					updates[
						key
					] as CmrDataTableFiltersType[typeof key]['value'],
				);
			}

			updateTableState({ filters: updatedFilters });
		},
		[filters, updateTableState],
	);

	const [searchClient, setSearchClient] = useState(
		filters.client?.value ?? '',
	);

	const onResetClient = useCallback(() => {
		setSearchClient('');
	}, []);

	const resetCallbacks = useMemo(() => [onResetClient], [onResetClient]);

	useDataTableFilterReset({
		dataSource,
		defaultFilters: dataTableStateDefault.filters,
		updateTableState,
		onReset: resetCallbacks,
	});

	return (
		<div className="form-section flex-row flex-wrap gap-4 border-b border-line pb-4">
			<FormFiltersAutoComplete<CmrDataTableFiltersType, ClientModel>
				labelText="Client"
				fieldName="client"
				fieldNameId="client_id"
				fieldValue={searchClient}
				className="pl-8"
				icons={{
					left: <Icons.Client className="opacity-40 h-4.5 w-4.5" />,
				}}
				setFilterValues={setFilterValues}
				setSearch={setSearchClient}
				dataSourceKey="client"
				getOptionLabel={(m) => displayClientLabel(m)}
				getOptionKey={(m) => m.id}
			/>

			<FormFiltersSelect<CmrDataTableFiltersType>
				labelText="Type"
				fieldName="transport_type"
				fieldValue={filters.transport_type.value}
				options={transportTypes}
				onChange={(value) =>
					setFilterValues({
						transport_type: value as CmrTransportType,
					})
				}
			/>

			<FormFiltersSelect<CmrDataTableFiltersType>
				labelText="Status"
				fieldName="status"
				fieldValue={filters.status.value}
				options={statuses}
				onChange={(value) =>
					setFilterValues({ status: value as CmrStatus })
				}
			/>

			<FormFiltersDateRange<CmrDataTableFiltersType>
				labelText="Pick Scheduled Date"
				start={{
					fieldName: 'pick_scheduled_at_start',
					fieldValue: filters.pick_scheduled_at_start.value,
					onSelect: (value) =>
						setFilterValues({ pick_scheduled_at_start: value }),
				}}
				end={{
					fieldName: 'pick_scheduled_at_end',
					fieldValue: filters.pick_scheduled_at_end.value,
					onSelect: (value) =>
						setFilterValues({ pick_scheduled_at_end: value }),
				}}
			/>

			<FormFiltersShowDeleted
				checked={filters.is_deleted.value ?? false}
				onCheckedChange={(value) =>
					setFilterValues({ is_deleted: value })
				}
			/>

			<FormFiltersReset dataSource="cmr" />
		</div>
	);
};
