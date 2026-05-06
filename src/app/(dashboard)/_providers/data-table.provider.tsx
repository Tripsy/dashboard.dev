'use client';

import {
	createContext,
	type ReactNode,
	useContext,
	useMemo,
	useRef,
	useState,
} from 'react';
import { useStore } from 'zustand/react';
import {
	type DataSourceKey,
	DataSourceSectionEnum,
	type DataTableSelectionModeType,
	type DataTableStateType,
	getDataSourceConfig,
} from '@/config/data-source.config';
import { useDebouncedEffect } from '@/hooks/use-debounced-effect.hook';
import {
	createDataTableStore,
	type DataTableStoreType,
} from '@/stores/data-table.store';

type DataTableContextType<K extends DataSourceKey, Model> = {
	dataSource: K;
	selectionMode: DataTableSelectionModeType;
	dataTableStateDefault: DataTableStateType;
	dataTableStore: DataTableStoreType<K, Model>;
};

const DataTableContext = createContext<
	// biome-ignore lint/suspicious/noExplicitAny: Context is initialized without concrete generics; actual types are provided by the DataTable provider.
	DataTableContextType<any, any> | undefined
>(undefined);

function DataTableProvider<K extends DataSourceKey, Model>({
	dataSource,
	selectionMode,
	children,
}: {
	dataSource: K;
	selectionMode: DataTableSelectionModeType;
	children: ReactNode;
}) {
	const [dataTableStore] = useState<DataTableStoreType<K, Model>>(
		() =>
			createDataTableStore(
				DataSourceSectionEnum.DASHBOARD,
				dataSource,
			) as DataTableStoreType<K, Model>,
	);

	const dataTable = useMemo(
		() =>
			getDataSourceConfig(
				DataSourceSectionEnum.DASHBOARD,
				dataSource,
				'dataTable',
			),
		[dataSource],
	);

	const selectedEntries = useStore(
		dataTableStore,
		(state) => state.selectedEntries,
	);

	const prevSelectedEntriesRef = useRef<Model[]>([]);

	useDebouncedEffect(
		() => {
			const prev = prevSelectedEntriesRef.current;
			const { onRowSelect, onRowUnselect } = dataTable;

			if (onRowSelect) {
				const added = selectedEntries.filter(
					(e) => !prev.some((p) => p === e),
				);
				added.forEach(onRowSelect);
			}

			if (onRowUnselect) {
				const removed = prev.filter(
					(e) => !selectedEntries.some((s) => s === e),
				);
				removed.forEach(onRowUnselect);
			}

			prevSelectedEntriesRef.current = selectedEntries;
		},
		[dataTable, selectedEntries],
		500,
	);

	const contextValue = useMemo(
		() => ({
			dataSource,
			selectionMode,
			dataTableStateDefault: dataTable.state,
			dataTableStore,
		}),
		[dataSource, selectionMode, dataTable.state, dataTableStore],
	);

	return (
		<DataTableContext.Provider value={contextValue}>
			{children}
		</DataTableContext.Provider>
	);
}

function useDataTable<K extends DataSourceKey, Model>() {
	const context = useContext(DataTableContext);

	if (!context) {
		throw new Error('useDataTable must be used within a DataTableProvider');
	}

	return context as DataTableContextType<K, Model>;
}

export { DataTableProvider, useDataTable };
