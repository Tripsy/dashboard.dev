'use client';

import { type JSX, useMemo } from 'react';
import { DataTableActions } from '@/app/(dashboard)/_components/data-table-actions.component';
import DataTableList from '@/app/(dashboard)/_components/data-table-list.component';
import { DataTableModal } from '@/app/(dashboard)/_components/data-table-modal.component';
import { DataTableProvider } from '@/app/(dashboard)/_providers/data-table-provider';
import { createDataTableStore } from '@/app/(dashboard)/_stores/model.store';
import { DataTableClientAddressFilters } from '@/app/(dashboard)/dashboard/client-address/data-table-client-address-filters.component';
import { FormManageClientAddress } from '@/app/(dashboard)/dashboard/client-address/form-manage-client-address.component';
import { ViewClientAddress } from '@/app/(dashboard)/dashboard/client-address/view-client-address.component';
import { LoadingComponent } from '@/components/status.component';
import { useMounted } from '@/hooks/use-mounted.hook';
import { useTranslation } from '@/hooks/use-translation.hook';

const dataTableStore = createDataTableStore('client-address');

export const DataTableClientAddress = (): JSX.Element => {
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
			dataSource="client-address"
			selectionMode="checkbox"
			dataTableStore={dataTableStore}
		>
			<div className="table-container">
				<DataTableClientAddressFilters />
				<DataTableActions />
				<DataTableList dataKey="id" />
			</div>

			<DataTableModal
				modals={{
					// @ts-expect-error FormManageClientAddress props are injected at runtime via FormManage
					create: <FormManageClientAddress />,
					// @ts-expect-error FormManageClientAddress props are injected at runtime via FormManage
					update: <FormManageClientAddress />,
					view: <ViewClientAddress />,
				}}
				modalsProps={{
					view: { size: 'xl' },
				}}
			/>
		</DataTableProvider>
	);
};
