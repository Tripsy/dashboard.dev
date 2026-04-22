'use client';

import type { JSX } from 'react';
import { DataTableActions } from '@/app/(dashboard)/_components/data-table-actions.component';
import DataTableList from '@/app/(dashboard)/_components/data-table-list.component';
import { DataTableProvider } from '@/app/(dashboard)/_providers/data-table.provider';
import { DataTableCronHistoryFilters } from '@/app/(dashboard)/dashboard/cron-history/data-table-cron-history-filters.component';

export const DataTableCronHistory = (): JSX.Element => {
	return (
		<DataTableProvider dataSource="cron-history" selectionMode="multiple">
			<div className="table-container">
				<DataTableCronHistoryFilters />
				<DataTableActions />
				<DataTableList dataKey="id" />
			</div>
		</DataTableProvider>
	);
};
