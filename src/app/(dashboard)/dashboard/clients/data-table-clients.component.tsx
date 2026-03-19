'use client';

import { type JSX, useMemo } from 'react';
import { DataTableActions } from '@/app/(dashboard)/_components/data-table-actions.component';
import DataTableList from '@/app/(dashboard)/_components/data-table-list.component';
import { DataTableModal } from '@/app/(dashboard)/_components/data-table-modal.component';
import { DataTableProvider } from '@/app/(dashboard)/_providers/data-table-provider';
import { createDataTableStore } from '@/app/(dashboard)/_stores/model.store';
import { DataTableClientsFilters } from '@/app/(dashboard)/dashboard/clients/data-table-clients-filters.component';
import { FormManageClient } from '@/app/(dashboard)/dashboard/clients/form-manage-client.component';
import { ViewClient } from '@/app/(dashboard)/dashboard/clients/view-client.component';
import { LoadingComponent } from '@/components/status.component';
import { useMounted } from '@/hooks/use-mounted.hook';
import { useTranslation } from '@/hooks/use-translation.hook';

const dataTableStore = createDataTableStore('clients');

export const DataTableClients = (): JSX.Element => {
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
			dataSource="clients"
			selectionMode="checkbox"
			dataTableStore={dataTableStore}
		>
			<div className="table-container">
				<DataTableClientsFilters />
				<DataTableActions />
				<DataTableList dataKey="id" />
			</div>

			<DataTableModal
				modals={{
					// @ts-expect-error FormManageClient props are injected at runtime via FormManage
					create: <FormManageClient />,
					// @ts-expect-error FormManageClient props are injected at runtime via FormManage
					update: <FormManageClient />,
					view: <ViewClient />,
				}}
				modalsProps={{
					create: { size: 'x2l' },
					update: { size: 'x2l' },
					view: { size: 'x4l' },
				}}
			/>
		</DataTableProvider>
	);
};
