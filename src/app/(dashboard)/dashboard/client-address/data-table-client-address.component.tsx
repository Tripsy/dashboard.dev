'use client';

import type { JSX } from 'react';
import { DataTableActions } from '@/app/(dashboard)/_components/data-table-actions.component';
import DataTableList from '@/app/(dashboard)/_components/data-table-list.component';
import { DataTableProvider } from '@/app/(dashboard)/_providers/data-table.provider';
import { DataTableClientAddressFilters } from '@/app/(dashboard)/dashboard/client-address/data-table-client-address-filters.component';

export const DataTableClientAddress = (): JSX.Element => {
	return (
		<DataTableProvider dataSource="client-address" selectionMode="checkbox">
			<div className="table-container">
				<DataTableClientAddressFilters />
				<DataTableActions />
				<DataTableList dataKey="id" />
			</div>
		</DataTableProvider>
	);
};
