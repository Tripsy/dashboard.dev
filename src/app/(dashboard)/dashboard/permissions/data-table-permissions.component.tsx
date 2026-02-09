'use client';

import { type JSX, useMemo } from 'react';
import { DataTableActions } from '@/app/(dashboard)/_components/data-table-actions.component';
import DataTableList from '@/app/(dashboard)/_components/data-table-list.component';
import { DataTableModal } from '@/app/(dashboard)/_components/data-table-modal.component';
import { DataTableProvider } from '@/app/(dashboard)/_providers/data-table-provider';
import { createDataTableStore } from '@/app/(dashboard)/_stores/model.store';
import { DataTablePermissionsFilters } from '@/app/(dashboard)/dashboard/permissions/data-table-permissions-filters.component';
import { FormManagePermission } from '@/app/(dashboard)/dashboard/permissions/form-manage-permission.component';
import { LoadingComponent } from '@/components/status.component';
import { useMounted } from '@/hooks/use-mounted.hook';
import { useTranslation } from '@/hooks/use-translation.hook';

const dataTableStore = createDataTableStore('permissions');

export const DataTablePermissions = (): JSX.Element => {
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
			dataSource="permissions"
			selectionMode="checkbox"
			dataTableStore={dataTableStore}
		>
			<div className="standard-box p-4 shadow-md">
				<DataTablePermissionsFilters />
				<DataTableActions />
				<DataTableList dataKey="id" scrollHeight="400px" />
			</div>

			<DataTableModal
				modals={{
					// @ts-expect-error FormManagePermission props are injected at runtime via FormManage
					create: <FormManagePermission />,
					// @ts-expect-error FormManagePermission props are injected at runtime via FormManage
					update: <FormManagePermission />,
				}}
			/>
		</DataTableProvider>
	);
};
