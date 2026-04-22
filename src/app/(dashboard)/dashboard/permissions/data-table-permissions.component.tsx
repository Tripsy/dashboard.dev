'use client';

import type { JSX } from 'react';
import { DataTableActions } from '@/app/(dashboard)/_components/data-table-actions.component';
import DataTableList from '@/app/(dashboard)/_components/data-table-list.component';
import { DataTableProvider } from '@/app/(dashboard)/_providers/data-table.provider';
import { DataTablePermissionsFilters } from '@/app/(dashboard)/dashboard/permissions/data-table-permissions-filters.component';

export const DataTablePermissions = (): JSX.Element => {
	return (
		<DataTableProvider dataSource="permissions" selectionMode="checkbox">
			<div className="table-container">
				<DataTablePermissionsFilters />
				<DataTableActions />
				<DataTableList dataKey="id" />
			</div>
		</DataTableProvider>
	);
};
