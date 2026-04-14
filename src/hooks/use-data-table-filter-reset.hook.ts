import { useEffect, useRef } from 'react';
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

	// Intentionally not synced — default filters are fixed at mount time
	const defaultFiltersRef = useRef(defaultFilters);

	const onResetRef = useRef(onReset);

	useEffect(() => {
		onResetRef.current = onReset;
	}, [onReset]);

	useEffect(() => {
		return addFilterResetListener(async ({ source }) => {
			if (source !== dataSource) return;

			updateTableState({ filters: defaultFiltersRef.current });

			await refreshDataTable(dataSource);

			for (const reset of onResetRef.current) {
				reset();
			}
		});
	}, [dataSource, updateTableState, refreshDataTable]);
}
