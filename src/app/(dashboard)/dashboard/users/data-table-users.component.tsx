'use client';

import type { JSX } from 'react';
import { DataTableActions } from '@/app/(dashboard)/_components/data-table-actions.component';
import DataTableList from '@/app/(dashboard)/_components/data-table-list.component';
import { DataTableProvider } from '@/app/(dashboard)/_providers/data-table.provider';
import { DataTableFiltersUsers } from '@/app/(dashboard)/dashboard/users/data-table-filters-users.component';

export const DataTableUsers = (): JSX.Element => {
	return (
		<DataTableProvider dataSource="users" selectionMode="checkbox">
			<div className="table-container">
				<DataTableFiltersUsers />
				<DataTableActions />
				<DataTableList dataKey="id" />
			</div>
		</DataTableProvider>
	);
};
