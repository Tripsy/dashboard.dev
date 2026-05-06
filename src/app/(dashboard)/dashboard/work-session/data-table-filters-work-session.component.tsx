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
import type { WorkSessionDataTableFiltersType } from '@/app/(dashboard)/dashboard/work-session/work-session.definition';
import { Icons } from '@/components/icon.component';
import { toOptionsFromEnum } from '@/helpers/form.helper';
import { formatEnumLabel } from '@/helpers/string.helper';
import { useDataTableFilterReset } from '@/hooks/use-data-table-filter-reset.hook';
import type { UserModel } from '@/models/user.model';
import {
	type WorkSessionModel,
	type WorkSessionStatus,
	WorkSessionStatusEnum,
} from '@/models/work-session.model';

const statuses = toOptionsFromEnum(WorkSessionStatusEnum, {
	formatter: formatEnumLabel,
});

export const DataTableFiltersWorkSession = (): JSX.Element => {
	const { dataSource, dataTableStateDefault, dataTableStore } = useDataTable<
		'work-session',
		WorkSessionModel
	>();

	const filters = useStore(
		dataTableStore,
		(state) => state.tableState.filters,
	) as WorkSessionDataTableFiltersType;

	const updateTableState = useStore(
		dataTableStore,
		(state) => state.updateTableState,
	);

	const setFilterValues = useCallback(
		(
			updates: Partial<{
				[K in keyof WorkSessionDataTableFiltersType]: WorkSessionDataTableFiltersType[K]['value'];
			}>,
		) => {
			const updatedFilters = { ...filters };

			function applyUpdate<
				K extends keyof WorkSessionDataTableFiltersType,
			>(
				key: K,
				value: WorkSessionDataTableFiltersType[K]['value'],
			): void {
				updatedFilters[key] = {
					...filters[key],
					value,
				};
			}

			for (const key of Object.keys(updates) as Array<
				keyof WorkSessionDataTableFiltersType
			>) {
				applyUpdate(
					key,
					updates[
						key
					] as WorkSessionDataTableFiltersType[typeof key]['value'],
				);
			}

			updateTableState({ filters: updatedFilters });
		},
		[filters, updateTableState],
	);

	const [searchUser, setSearchUser] = useState(filters.user?.value ?? '');

	const onResetUser = useCallback(() => {
		setSearchUser('');
	}, []);

	const resetCallbacks = useMemo(() => [onResetUser], [onResetUser]);

	useDataTableFilterReset({
		dataSource,
		defaultFilters: dataTableStateDefault.filters,
		updateTableState,
		onReset: resetCallbacks,
	});

	return (
		<div className="form-section flex-row flex-wrap gap-4 border-b border-line pb-4">
			<FormFiltersAutoComplete<WorkSessionDataTableFiltersType, UserModel>
				labelText="User"
				fieldName="user"
				fieldNameId="user_id"
				fieldValue={searchUser}
				className="pl-8"
				icons={{
					left: <Icons.User className="opacity-40 h-4.5 w-4.5" />,
				}}
				setFilterValues={setFilterValues}
				setSearch={setSearchUser}
				dataSourceKey="user"
				getOptionLabel={(m) => m.name}
				getOptionKey={(m) => m.id}
			/>

			<FormFiltersSelect<WorkSessionDataTableFiltersType>
				labelText="Status"
				fieldName="status"
				fieldValue={filters.status.value}
				options={statuses}
				onChange={(value) =>
					setFilterValues({ status: value as WorkSessionStatus })
				}
			/>

			<FormFiltersDateRange<WorkSessionDataTableFiltersType>
				labelText="Start Date"
				start={{
					fieldName: 'start_at_start',
					fieldValue: filters.start_at_start.value,
					onSelect: (value) =>
						setFilterValues({ start_at_start: value }),
				}}
				end={{
					fieldName: 'start_at_end',
					fieldValue: filters.start_at_end.value,
					onSelect: (value) =>
						setFilterValues({ start_at_end: value }),
				}}
			/>

			<FormFiltersShowDeleted
				checked={filters.is_deleted.value ?? false}
				onCheckedChange={(value) =>
					setFilterValues({ is_deleted: value })
				}
			/>

			<FormFiltersReset dataSource="work-session" />
		</div>
	);
};
