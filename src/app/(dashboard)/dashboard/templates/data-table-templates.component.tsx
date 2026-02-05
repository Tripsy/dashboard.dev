'use client';

import { type JSX, useMemo } from 'react';
import { DataTableActions } from '@/app/(dashboard)/_components/data-table-actions.component';
import DataTableList from '@/app/(dashboard)/_components/data-table-list.component';
import { DataTableModal } from '@/app/(dashboard)/_components/data-table-modal.component';
import { DataTableProvider } from '@/app/(dashboard)/_providers/data-table-provider';
import { createDataTableStore } from '@/app/(dashboard)/_stores/model.store';
import { DataTableTemplatesFilters } from '@/app/(dashboard)/dashboard/templates/data-table-templates-filters.component';
import { FormManageTemplate } from '@/app/(dashboard)/dashboard/templates/form-manage-template.component';
import { ViewTemplate } from '@/app/(dashboard)/dashboard/templates/view-template.component';
import { Loading } from '@/components/loading.component';
import { useMounted, useTranslation } from '@/hooks';

const dataTableStore = createDataTableStore('templates');

export const DataTableTemplates = (): JSX.Element => {
	const translationsKeys = useMemo(() => ['app.text.loading'] as const, []);

	const { translations } = useTranslation(translationsKeys);
	const isMounted = useMounted();

	if (!isMounted) {
		return <Loading text={translations['app.text.loading']} />;
	}

	return (
		<DataTableProvider
			dataSource="templates"
			selectionMode="checkbox"
			dataTableStore={dataTableStore}
		>
			<div className="standard-box p-4 shadow-md">
				<DataTableTemplatesFilters />
				<DataTableActions />
				<DataTableList dataKey="id" scrollHeight="400px" />
			</div>

			<DataTableModal
				modals={{
					// @ts-expect-error FormManageTemplate props are injected at runtime via FormManage
					create: <FormManageTemplate />,
					// @ts-expect-error FormManageTemplate props are injected at runtime via FormManage
					update: <FormManageTemplate />,
					view: <ViewTemplate />,
				}}
				modalClass={{
					create: 'max-w-4xl!',
					update: 'max-w-4xl!',
					view: 'max-w-4xl!',
				}}
			/>
		</DataTableProvider>
	);
};
