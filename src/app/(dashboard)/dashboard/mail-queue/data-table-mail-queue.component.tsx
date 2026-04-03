'use client';

import { type JSX, useMemo } from 'react';
import { DataTableActions } from '@/app/(dashboard)/_components/data-table-actions.component';
import DataTableList from '@/app/(dashboard)/_components/data-table-list.component';
import { DataTableProvider } from '@/app/(dashboard)/_providers/data-table-provider';
import { DataTableMailQueueFilters } from '@/app/(dashboard)/dashboard/mail-queue/data-table-mail-queue-filters.component';
import { LoadingComponent } from '@/components/status.component';
import { useMounted } from '@/hooks/use-mounted.hook';
import { useTranslation } from '@/hooks/use-translation.hook';
import { createDataTableStore } from '@/stores/data-table.store';

const dataTableStore = createDataTableStore('mail-queue');

export const DataTableMailQueue = (): JSX.Element => {
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
			dataSource="mail-queue"
			selectionMode="multiple"
			dataTableStore={dataTableStore}
		>
			<div className="table-container">
				<DataTableMailQueueFilters />
				<DataTableActions />
				<DataTableList dataKey="id" scrollHeight="420px" />
			</div>
		</DataTableProvider>
	);
};
