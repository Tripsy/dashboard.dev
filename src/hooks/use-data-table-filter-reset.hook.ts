import { useEffect } from 'react';
import { addFilterResetListener } from '@/app/(dashboard)/_events/data-table-filter-reset.event';
import type {
	DataSourceKey,
	DataTableFiltersType,
	DataTableStateType,
} from '@/config/data-source.config';
import { useRefreshDataTable } from '@/hooks/use-refresh-data-table.hook';

type UseDataTableFilterResetOptions = {
	dataSource: DataSourceKey;
	defaultFilters: DataTableFiltersType;
	updateTableState: (state: Partial<DataTableStateType>) => void;
	onReset?: (() => void)[];
};

export function useDataTableFilterReset({
	dataSource,
	defaultFilters,
	updateTableState,
	onReset = [],
}: UseDataTableFilterResetOptions) {
	const refreshDataTable = useRefreshDataTable();

	useEffect(() => {
		return addFilterResetListener(async ({ source }) => {
			if (source !== dataSource) return;

			updateTableState({ filters: defaultFilters });

			for (const reset of onReset) {
				reset();
			}

			await refreshDataTable(dataSource);
		});
	}, [
		dataSource,
		defaultFilters,
		updateTableState,
		refreshDataTable,
		onReset,
	]);
}
