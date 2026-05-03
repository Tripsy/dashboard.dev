'use client';

import type { JSX } from 'react';
import { DataTableActions } from '@/app/(dashboard)/_components/data-table-actions.component';
import DataTableList from '@/app/(dashboard)/_components/data-table-list.component';
import { DataTableProvider } from '@/app/(dashboard)/_providers/data-table.provider';
import { DataTableFiltersWorkSessionVehicles } from '@/app/(dashboard)/dashboard/work-session-vehicles/data-table-filters-work-session-vehicles.component';

export const DataTableWorkSessionVehicles = (): JSX.Element => {
	return (
		<DataTableProvider
			dataSource="work-session-vehicles"
			selectionMode="checkbox"
		>
			<div className="table-container">
				<DataTableFiltersWorkSessionVehicles />
				<DataTableActions />
				<DataTableList dataKey="id" />
			</div>
		</DataTableProvider>
	);
};
