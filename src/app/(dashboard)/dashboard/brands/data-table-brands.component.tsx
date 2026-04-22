'use client';

import type { JSX } from 'react';
import { DataTableActions } from '@/app/(dashboard)/_components/data-table-actions.component';
import DataTableList from '@/app/(dashboard)/_components/data-table-list.component';
import { DataTableProvider } from '@/app/(dashboard)/_providers/data-table.provider';
import { DataTableBrandsFilters } from '@/app/(dashboard)/dashboard/brands/data-table-brands-filters.component';

export const DataTableBrands = (): JSX.Element => {
	return (
		<DataTableProvider dataSource="brands" selectionMode="checkbox">
			<div className="table-container">
				<DataTableBrandsFilters />
				<DataTableActions />
				<DataTableList dataKey="id" />
			</div>
		</DataTableProvider>
	);
};
