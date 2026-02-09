'use client';

import { type JSX, useMemo } from 'react';
import { DataTableActions } from '@/app/(dashboard)/_components/data-table-actions.component';
import DataTableList from '@/app/(dashboard)/_components/data-table-list.component';
import { DataTableModal } from '@/app/(dashboard)/_components/data-table-modal.component';
import { DataTableProvider } from '@/app/(dashboard)/_providers/data-table-provider';
import { createDataTableStore } from '@/app/(dashboard)/_stores/model.store';
import { DataTableMailQueueFilters } from '@/app/(dashboard)/dashboard/mail-queue/data-table-mail-queue-filters.component';
import { ViewMailQueue } from '@/app/(dashboard)/dashboard/mail-queue/view-mail-queue.component';
import { ViewMailQueueTemplate } from '@/app/(dashboard)/dashboard/mail-queue/view-mail-queue-template.component';
import { LoadingComponent } from '@/components/status.component';
import { useMounted } from '@/hooks/use-mounted.hook';
import { useTranslation } from '@/hooks/use-translation.hook';

const dataTableStore = createDataTableStore('mail-queue');

export const DataTableMailQueue = (): JSX.Element => {
	const translationsKeys = useMemo(() => ['app.text.loading'] as const, []);

	const { translations } = useTranslation(translationsKeys);
	const isMounted = useMounted();

	if (!isMounted) {
		return <LoadingComponent text={translations['app.text.loading']} />;
	}

	return (
		<DataTableProvider
			dataSource="mail-queue"
			selectionMode="multiple"
			dataTableStore={dataTableStore}
		>
			<div className="standard-box p-4 shadow-md">
				<DataTableMailQueueFilters />
				<DataTableActions />
				<DataTableList dataKey="id" scrollHeight="400px" />
			</div>

			<DataTableModal
				modals={{
					view: <ViewMailQueue />,
					viewTemplate: <ViewMailQueueTemplate />,
				}}
				modalClass={{
					view: 'max-w-3xl!',
					viewTemplate: 'max-w-3xl!',
				}}
			/>
		</DataTableProvider>
	);
};
