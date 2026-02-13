'use client';

import { type JSX, useMemo } from 'react';
import { DataTableActions } from '@/app/(dashboard)/_components/data-table-actions.component';
import DataTableList from '@/app/(dashboard)/_components/data-table-list.component';
import { DataTableModal } from '@/app/(dashboard)/_components/data-table-modal.component';
import { DataTableProvider } from '@/app/(dashboard)/_providers/data-table-provider';
import { createDataTableStore } from '@/app/(dashboard)/_stores/model.store';
import { DataTableUsersFilters } from '@/app/(dashboard)/dashboard/users/data-table-users-filters.component';
import { FormManageUser } from '@/app/(dashboard)/dashboard/users/form-manage-user.component';
import { SetupPermissionsUser } from '@/app/(dashboard)/dashboard/users/setup-permissions-user.component';
import { ViewUser } from '@/app/(dashboard)/dashboard/users/view-user.component';
import { LoadingComponent } from '@/components/status.component';
import { useMounted } from '@/hooks/use-mounted.hook';
import { useTranslation } from '@/hooks/use-translation.hook';

const dataTableStore = createDataTableStore('users');

export const DataTableUsers = (): JSX.Element => {
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
			dataSource="users"
			selectionMode="checkbox"
			dataTableStore={dataTableStore}
		>
			<div className="table-container">
				<DataTableUsersFilters />
				<DataTableActions />
				<DataTableList dataKey="id" scrollHeight="400px" />
			</div>

			<DataTableModal
				modals={{
					// @ts-expect-error FormManageUser props are injected at runtime via FormManage
					create: <FormManageUser />,
					// @ts-expect-error FormManageUser props are injected at runtime via FormManage
					update: <FormManageUser />,
					permissions: <SetupPermissionsUser />,
					view: <ViewUser />,
				}}
				modalsProps={{
					permissions: { size: 'lg' },
					view: { size: 'xl' },
				}}
			/>
		</DataTableProvider>
	);
};
