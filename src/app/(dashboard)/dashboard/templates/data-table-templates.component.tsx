'use client';

import type { JSX } from 'react';
import { DataTableActions } from '@/app/(dashboard)/_components/data-table-actions.component';
import DataTableList from '@/app/(dashboard)/_components/data-table-list.component';
import { DataTableProvider } from '@/app/(dashboard)/_providers/data-table.provider';
import { DataTableFiltersTemplates } from '@/app/(dashboard)/dashboard/templates/data-table-filters-templates.component';

export const DataTableTemplates = (): JSX.Element => {
	return (
		<DataTableProvider dataSource="templates" selectionMode="checkbox">
			<div className="table-container">
				<DataTableFiltersTemplates />
				<DataTableActions />
				<DataTableList dataKey="id" />
			</div>
		</DataTableProvider>
	);
};
