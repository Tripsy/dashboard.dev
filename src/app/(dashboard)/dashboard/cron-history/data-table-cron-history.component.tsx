'use client';

import { type JSX, useMemo } from 'react';
import { DataTableActions } from '@/app/(dashboard)/_components/data-table-actions.component';
import DataTableList from '@/app/(dashboard)/_components/data-table-list.component';
import { DataTableModal } from '@/app/(dashboard)/_components/data-table-modal.component';
import { DataTableProvider } from '@/app/(dashboard)/_providers/data-table-provider';
import { createDataTableStore } from '@/app/(dashboard)/_stores/model.store';
import { DataTableCronHistoryFilters } from '@/app/(dashboard)/dashboard/cron-history/data-table-cron-history-filters.component';
import { ViewCronHistory } from '@/app/(dashboard)/dashboard/cron-history/view-cron-history.component';
import { LoadingComponent } from '@/components/status.component';
import { useMounted } from '@/hooks/use-mounted.hook';
import { useTranslation } from '@/hooks/use-translation.hook';

const dataTableStore = createDataTableStore('cron-history');

export const DataTableCronHistory = (): JSX.Element => {
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
			dataSource="cron-history"
			selectionMode="multiple"
			dataTableStore={dataTableStore}
		>
			<div className="table-container">
				<DataTableCronHistoryFilters />
				<DataTableActions />
				<DataTableList dataKey="id" />
			</div>

			<DataTableModal
				modals={{
					view: <ViewCronHistory />,
				}}
				modalsProps={{
					view: { size: 'x2l' },
				}}
			/>
		</DataTableProvider>
	);
};
