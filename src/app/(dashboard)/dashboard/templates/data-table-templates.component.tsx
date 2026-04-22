'use client';

import type { JSX } from 'react';
import { DataTableActions } from '@/app/(dashboard)/_components/data-table-actions.component';
import DataTableList from '@/app/(dashboard)/_components/data-table-list.component';
import { DataTableProvider } from '@/app/(dashboard)/_providers/data-table.provider';
import { DataTableTemplatesFilters } from '@/app/(dashboard)/dashboard/templates/data-table-templates-filters.component';

export const DataTableTemplates = (): JSX.Element => {
	return (
		<DataTableProvider dataSource="templates" selectionMode="checkbox">
			<div className="table-container">
				<DataTableTemplatesFilters />
				<DataTableActions />
				<DataTableList dataKey="id" />
			</div>
		</DataTableProvider>
	);
};
