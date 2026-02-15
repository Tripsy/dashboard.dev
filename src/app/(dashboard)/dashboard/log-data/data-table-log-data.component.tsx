'use client';

import { type JSX, useMemo } from 'react';
import { DataTableActions } from '@/app/(dashboard)/_components/data-table-actions.component';
import DataTableList from '@/app/(dashboard)/_components/data-table-list.component';
import { DataTableModal } from '@/app/(dashboard)/_components/data-table-modal.component';
import { DataTableProvider } from '@/app/(dashboard)/_providers/data-table-provider';
import { createDataTableStore } from '@/app/(dashboard)/_stores/model.store';
import { DataTableLogDataFilters } from '@/app/(dashboard)/dashboard/log-data/data-table-log-data-filters.component';
import { ViewLogData } from '@/app/(dashboard)/dashboard/log-data/view-log-data.component';
import { LoadingComponent } from '@/components/status.component';
import { useMounted } from '@/hooks/use-mounted.hook';
import { useTranslation } from '@/hooks/use-translation.hook';

const dataTableStore = createDataTableStore('log-data');

export const DataTableLogData = (): JSX.Element => {
	const translationsKeys = useMemo(() => ['app.text.loading'] as const, []);

	const { translations } = useTranslation(translationsKeys);
	const isMounted = useMounted();

	if (!isMounted) {
		return (
			<LoadingComponent description={translations['app.text.loading']} />
		);
	}

	return (
		<DataTableProvider
			dataSource="log-data"
			selectionMode="multiple"
			dataTableStore={dataTableStore}
		>
			<div className="table-container">
				<DataTableLogDataFilters />
				<DataTableActions />
				<DataTableList dataKey="id" />
			</div>

			<DataTableModal
				modals={{
					view: <ViewLogData />,
				}}
				modalsProps={{
					view: { size: 'x3l' },
				}}
			/>
		</DataTableProvider>
	);
};
