'use client';

import type { JSX } from 'react';
import { DataTableActions } from '@/app/(dashboard)/_components/data-table-actions.component';
import DataTableList from '@/app/(dashboard)/_components/data-table-list.component';
import { DataTableProvider } from '@/app/(dashboard)/_providers/data-table.provider';
import { DataTableCashFlowFilters } from '@/app/(dashboard)/dashboard/cash-flow/data-table-cash-flow-filters.component';

export const DataTableCashFlow = (): JSX.Element => {
	return (
		<DataTableProvider dataSource="cash-flow" selectionMode="checkbox">
			<div className="table-container">
				<DataTableCashFlowFilters />
				<DataTableActions />
				<DataTableList dataKey="id" />
			</div>
		</DataTableProvider>
	);
};
