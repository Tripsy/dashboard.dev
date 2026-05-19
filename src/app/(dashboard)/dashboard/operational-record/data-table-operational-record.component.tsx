'use client';

import type { JSX } from 'react';
import { DataTableActions } from '@/app/(dashboard)/_components/data-table-actions.component';
import DataTableList from '@/app/(dashboard)/_components/data-table-list.component';
import { DataTableProvider } from '@/app/(dashboard)/_providers/data-table.provider';
import { DataTableFiltersOperationalRecord } from '@/app/(dashboard)/dashboard/operational-record/data-table-filters-operational-record.component';

export const DataTableOperationalRecord = (): JSX.Element => {
	return (
		<DataTableProvider
			dataSource="operational-record"
			selectionMode="checkbox"
		>
			<div className="table-container">
				<DataTableFiltersOperationalRecord />
				<DataTableActions />
				<DataTableList dataKey="id" />
			</div>
		</DataTableProvider>
	);
};
