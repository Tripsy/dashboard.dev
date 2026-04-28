'use client';

import type { JSX } from 'react';
import { DataTableActions } from '@/app/(dashboard)/_components/data-table-actions.component';
import DataTableList from '@/app/(dashboard)/_components/data-table-list.component';
import { DataTableProvider } from '@/app/(dashboard)/_providers/data-table.provider';
import { DataTableFiltersCompanyVehicles } from '@/app/(dashboard)/dashboard/company-vehicles/data-table-filters-company-vehicles.component';

export const DataTableCompanyVehicles = (): JSX.Element => {
	return (
		<DataTableProvider
			dataSource="company-vehicles"
			selectionMode="checkbox"
		>
			<div className="table-container">
				<DataTableFiltersCompanyVehicles />
				<DataTableActions />
				<DataTableList dataKey="id" />
			</div>
		</DataTableProvider>
	);
};
