'use client';

import type { JSX } from 'react';
import { DataTableActions } from '@/app/(dashboard)/_components/data-table-actions.component';
import DataTableList from '@/app/(dashboard)/_components/data-table-list.component';
import { DataTableProvider } from '@/app/(dashboard)/_providers/data-table.provider';
import { DataTableLogHistoryFilters } from '@/app/(dashboard)/dashboard/log-history/data-table-log-history-filters.component';

export const DataTableLogHistory = (): JSX.Element => {
	return (
		<DataTableProvider dataSource="log-history" selectionMode="multiple">
			<div className="table-container">
				<DataTableLogHistoryFilters />
				<DataTableActions />
				<DataTableList dataKey="id" />
			</div>
		</DataTableProvider>
	);
};
