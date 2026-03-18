'use client';

import { type JSX, useMemo } from 'react';
import { DataTableActions } from '@/app/(dashboard)/_components/data-table-actions.component';
import DataTableList from '@/app/(dashboard)/_components/data-table-list.component';
import { DataTableModal } from '@/app/(dashboard)/_components/data-table-modal.component';
import { DataTableProvider } from '@/app/(dashboard)/_providers/data-table-provider';
import { createDataTableStore } from '@/app/(dashboard)/_stores/model.store';
import { DataTableBrandsFilters } from '@/app/(dashboard)/dashboard/brands/data-table-brands-filters.component';
import { FormManageBrand } from '@/app/(dashboard)/dashboard/brands/form-manage-brand.component';
import { LoadingComponent } from '@/components/status.component';
import { useMounted } from '@/hooks/use-mounted.hook';
import { useTranslation } from '@/hooks/use-translation.hook';

const dataTableStore = createDataTableStore('brands');

export const DataTableBrands = (): JSX.Element => {
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
			dataSource="brands"
			selectionMode="checkbox"
			dataTableStore={dataTableStore}
		>
			<div className="table-container">
				<DataTableBrandsFilters />
				<DataTableActions />
				<DataTableList dataKey="id" />
			</div>

			<DataTableModal
				modals={{
					// @ts-expect-error FormManageBrand props are injected at runtime via FormManage
					create: <FormManageBrand />,
					// @ts-expect-error FormManageBrand props are injected at runtime via FormManage
					update: <FormManageBrand />,
				}}
				modalsProps={{}}
			/>
		</DataTableProvider>
	);
};
