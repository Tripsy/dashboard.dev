'use client';

import type { JSX } from 'react';
import { DataTableActions } from '@/app/(dashboard)/_components/data-table-actions.component';
import DataTableList from '@/app/(dashboard)/_components/data-table-list.component';
import { DataTableProvider } from '@/app/(dashboard)/_providers/data-table.provider';
import { DataTableFiltersBrands } from '@/app/(dashboard)/dashboard/brands/data-table-filters-brands.component';

export const DataTableBrands = (): JSX.Element => {
	return (
		<DataTableProvider dataSource="brands" selectionMode="checkbox">
			<div className="table-container">
				<DataTableFiltersBrands />
				<DataTableActions />
				<DataTableList dataKey="id" />
			</div>
		</DataTableProvider>
	);
};
