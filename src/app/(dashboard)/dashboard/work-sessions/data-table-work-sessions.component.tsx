'use client';

import type { JSX } from 'react';
import { DataTableActions } from '@/app/(dashboard)/_components/data-table-actions.component';
import DataTableList from '@/app/(dashboard)/_components/data-table-list.component';
import { DataTableProvider } from '@/app/(dashboard)/_providers/data-table.provider';
import { DataTableFiltersWorkSessions } from '@/app/(dashboard)/dashboard/work-sessions/data-table-filters-work-sessions.component';

export const DataTableWorkSessions = (): JSX.Element => {
	return (
		<DataTableProvider dataSource="work-sessions" selectionMode="checkbox">
			<div className="table-container">
				<DataTableFiltersWorkSessions />
				<DataTableActions />
				<DataTableList dataKey="id" />
			</div>
		</DataTableProvider>
	);
};
