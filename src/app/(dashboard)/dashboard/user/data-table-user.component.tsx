'use client';

import type { JSX } from 'react';
import { DataTableActions } from '@/app/(dashboard)/_components/data-table-actions.component';
import DataTableList from '@/app/(dashboard)/_components/data-table-list.component';
import { DataTableProvider } from '@/app/(dashboard)/_providers/data-table.provider';
import { DataTableFiltersUser } from '@/app/(dashboard)/dashboard/user/data-table-filters-user.component';
import {DataSourceSectionEnum, loadDataSource} from "@/config/data-source.config";
import {dataSourceConfigUser} from "@/app/(dashboard)/dashboard/user/user.definition";

loadDataSource(
	DataSourceSectionEnum.DASHBOARD,
	'user',
	dataSourceConfigUser,
);

export const DataTableUser = (): JSX.Element => {
	return (
		<DataTableProvider dataSource="user" selectionMode="checkbox">
			<div className="table-container">
				<DataTableFiltersUser />
				<DataTableActions />
				<DataTableList dataKey="id" />
			</div>
		</DataTableProvider>
	);
};
