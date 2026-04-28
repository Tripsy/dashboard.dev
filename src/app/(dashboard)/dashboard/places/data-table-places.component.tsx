'use client';

import type { JSX } from 'react';
import { DataTableActions } from '@/app/(dashboard)/_components/data-table-actions.component';
import DataTableList from '@/app/(dashboard)/_components/data-table-list.component';
import { DataTableProvider } from '@/app/(dashboard)/_providers/data-table.provider';
import { DataTableFiltersPlaces } from '@/app/(dashboard)/dashboard/places/data-table-filters-places.component';

export const DataTablePlaces = (): JSX.Element => {
	return (
		<DataTableProvider dataSource="places" selectionMode="checkbox">
			<div className="table-container">
				<DataTableFiltersPlaces />
				<DataTableActions />
				<DataTableList dataKey="id" />
			</div>
		</DataTableProvider>
	);
};
