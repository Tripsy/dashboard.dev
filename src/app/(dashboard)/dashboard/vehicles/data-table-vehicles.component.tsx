'use client';

import type { JSX } from 'react';
import { DataTableActions } from '@/app/(dashboard)/_components/data-table-actions.component';
import DataTableList from '@/app/(dashboard)/_components/data-table-list.component';
import { DataTableProvider } from '@/app/(dashboard)/_providers/data-table.provider';
import { DataTableVehiclesFilters } from '@/app/(dashboard)/dashboard/vehicles/data-table-vehicles-filters.component';

export const DataTableVehicles = (): JSX.Element => {
	return (
		<DataTableProvider dataSource="vehicles" selectionMode="checkbox">
			<div className="table-container">
				<DataTableVehiclesFilters />
				<DataTableActions />
				<DataTableList dataKey="id" />
			</div>
		</DataTableProvider>
	);
};
