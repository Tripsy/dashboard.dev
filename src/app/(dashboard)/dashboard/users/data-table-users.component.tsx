'use client';

import type { JSX } from 'react';
import { DataTableActions } from '@/app/(dashboard)/_components/data-table-actions.component';
import DataTableList from '@/app/(dashboard)/_components/data-table-list.component';
import { DataTableProvider } from '@/app/(dashboard)/_providers/data-table.provider';
import { DataTableUsersFilters } from '@/app/(dashboard)/dashboard/users/data-table-users-filters.component';

export const DataTableUsers = (): JSX.Element => {
	return (
		<DataTableProvider dataSource="users" selectionMode="checkbox">
			<div className="table-container">
				<DataTableUsersFilters />
				<DataTableActions />
				<DataTableList dataKey="id" />
			</div>
		</DataTableProvider>
	);
};
