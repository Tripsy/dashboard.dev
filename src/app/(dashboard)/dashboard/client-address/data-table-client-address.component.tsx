'use client';

import type { JSX } from 'react';
import { DataTableActions } from '@/app/(dashboard)/_components/data-table-actions.component';
import DataTableList from '@/app/(dashboard)/_components/data-table-list.component';
import { DataTableProvider } from '@/app/(dashboard)/_providers/data-table.provider';
import { DataTableFiltersClientAddress } from '@/app/(dashboard)/dashboard/client-address/data-table-filters-client-address.component';

export const DataTableClientAddress = (): JSX.Element => {
	return (
		<DataTableProvider dataSource="client-address" selectionMode="checkbox">
			<div className="table-container">
				<DataTableFiltersClientAddress />
				<DataTableActions />
				<DataTableList dataKey="id" />
			</div>
		</DataTableProvider>
	);
};
