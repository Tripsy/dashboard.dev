'use client';

import { type JSX, useMemo } from 'react';
import { DataTableActions } from '@/app/(dashboard)/_components/data-table-actions.component';
import DataTableList from '@/app/(dashboard)/_components/data-table-list.component';
import { DataTableModal } from '@/app/(dashboard)/_components/data-table-modal.component';
import { DataTableProvider } from '@/app/(dashboard)/_providers/data-table-provider';
import { createDataTableStore } from '@/app/(dashboard)/_stores/model.store';
import { DataTableLogHistoryFilters } from '@/app/(dashboard)/dashboard/log-history/data-table-log-history-filters.component';
import { ViewLogHistory } from '@/app/(dashboard)/dashboard/log-history/view-log-history.component';
import { ViewLogHistoryUser } from '@/app/(dashboard)/dashboard/log-history/view-log-history-user.component';
import { Loading } from '@/components/loading.component';
import { useMounted, useTranslation } from '@/hooks';

const dataTableStore = createDataTableStore('log_history');

export const DataTableLogHistory = (): JSX.Element => {
	const translationsKeys = useMemo(() => ['app.text.loading'] as const, []);

	const { translations } = useTranslation(translationsKeys);
	const isMounted = useMounted();

	if (!isMounted) {
		return <Loading text={translations['app.text.loading']} />;
	}

	return (
		<DataTableProvider
			dataSource="log_history"
			selectionMode="multiple"
			dataTableStore={dataTableStore}
		>
			<div className="standard-box p-4 shadow-md">
				<DataTableLogHistoryFilters />
				<DataTableActions />
				<DataTableList dataKey="id" scrollHeight="400px" />
			</div>

			<DataTableModal<'log_history'>
				modals={{
					view: <ViewLogHistory />,
					viewUser: <ViewLogHistoryUser />,
				}}
				modalClass={{
					view: 'max-w-3xl!',
					viewUser: 'max-w-2xl!',
				}}
			/>
		</DataTableProvider>
	);
};
