'use client';

import { type JSX, useMemo } from 'react';
import { DataTableActions } from '@/app/(dashboard)/_components/data-table-actions.component';
import DataTableList from '@/app/(dashboard)/_components/data-table-list.component';
import { DataTableModal } from '@/app/(dashboard)/_components/data-table-modal.component';
import { DataTableProvider } from '@/app/(dashboard)/_providers/data-table-provider';
import { createDataTableStore } from '@/app/(dashboard)/_stores/model.store';
import { DataTablePlacesFilters } from '@/app/(dashboard)/dashboard/places/data-table-places-filters.component';
import { FormManagePlace } from '@/app/(dashboard)/dashboard/places/form-manage-place.component';
import { LoadingComponent } from '@/components/status.component';
import { useMounted } from '@/hooks/use-mounted.hook';
import { useTranslation } from '@/hooks/use-translation.hook';

const dataTableStore = createDataTableStore('places');

export const DataTablePlaces = (): JSX.Element => {
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
			dataSource="places"
			selectionMode="checkbox"
			dataTableStore={dataTableStore}
		>
			<div className="table-container">
				<DataTablePlacesFilters />
				<DataTableActions />
				<DataTableList dataKey="id" />
			</div>

			<DataTableModal
				modals={{
					// @ts-expect-error FormManagePlace props are injected at runtime via FormManage
					create: <FormManagePlace />,
					// @ts-expect-error FormManagePlace props are injected at runtime via FormManage
					update: <FormManagePlace />,
				}}
				modalsProps={{}}
			/>
		</DataTableProvider>
	);
};
