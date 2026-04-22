'use client';

import type { JSX } from 'react';
import { DataTableActions } from '@/app/(dashboard)/_components/data-table-actions.component';
import DataTableList from '@/app/(dashboard)/_components/data-table-list.component';
import { DataTableProvider } from '@/app/(dashboard)/_providers/data-table.provider';
import { DataTableClientsFilters } from '@/app/(dashboard)/dashboard/clients/data-table-clients-filters.component';

export const DataTableClients = (): JSX.Element => {
	return (
		<DataTableProvider dataSource="clients" selectionMode="checkbox">
			<div className="table-container">
				<DataTableClientsFilters />
				<DataTableActions />
				<DataTableList dataKey="id" />
			</div>
		</DataTableProvider>
	);
};
