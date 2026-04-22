'use client';

import type { JSX } from 'react';
import { DataTableActions } from '@/app/(dashboard)/_components/data-table-actions.component';
import DataTableList from '@/app/(dashboard)/_components/data-table-list.component';
import { DataTableProvider } from '@/app/(dashboard)/_providers/data-table.provider';
import { DataTableMailQueueFilters } from '@/app/(dashboard)/dashboard/mail-queue/data-table-mail-queue-filters.component';

export const DataTableMailQueue = (): JSX.Element => {
	return (
		<DataTableProvider dataSource="mail-queue" selectionMode="multiple">
			<div className="table-container">
				<DataTableMailQueueFilters />
				<DataTableActions />
				<DataTableList dataKey="id" scrollHeight="420px" />
			</div>
		</DataTableProvider>
	);
};
