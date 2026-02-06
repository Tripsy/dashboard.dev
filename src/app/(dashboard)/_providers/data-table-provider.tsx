'use client';

import {
	createContext,
	type ReactNode,
	useContext,
	useMemo,
	useRef,
} from 'react';
import { useStore } from 'zustand/react';
import type { DataTableStoreType } from '@/app/(dashboard)/_stores/model.store';
import {
	type DataSourceKey,
	type DataTableSelectionModeType,
	type DataTableStateType,
	getDataSourceConfig,
} from '@/config/data-source.config';
import { useDebouncedEffect } from '@/hooks/use-debounced-effect.hook';

type DataTableContextType<K extends DataSourceKey, Model> = {
	dataSource: K;
	dataStorageKey: string;
	selectionMode: DataTableSelectionModeType;
	stateDefault: DataTableStateType;
	dataTableStore: DataTableStoreType<K, Model>;
};

const DataTableContext = createContext<
	// biome-ignore lint/suspicious/noExplicitAny: Context is initialized without concrete generics; actual types are provided by the DataTable provider.
	DataTableContextType<any, any> | undefined
>(undefined);

function DataTableProvider<K extends DataSourceKey, Model>({
	dataSource,
	selectionMode,
	dataTableStore,
	children,
}: {
	dataSource: K;
	selectionMode: DataTableSelectionModeType;
	dataTableStore: DataTableStoreType<K, Model>;
	children: ReactNode;
}) {
	const dataStorageKey = useMemo(
		() => `data-table-state-${dataSource}`,
		[dataSource],
	);
	const stateDefault = getDataSourceConfig(dataSource, 'dataTableState');

	const selectedEntries = useStore(
		dataTableStore,
		(state) => state.selectedEntries,
	);

	const prevSelectedEntriesRef = useRef<Model[]>([]);

	useDebouncedEffect(
		() => {
			const functions = getDataSourceConfig(dataSource, 'functions');

			const onRowSelect = functions.onRowSelect;
			const onRowUnselect = functions.onRowUnselect;

			const prevSelected = prevSelectedEntriesRef.current;

			if (onRowSelect && selectedEntries.length === 1) {
				onRowSelect(selectedEntries[0]);
			}

			if (
				onRowUnselect &&
				selectedEntries.length === 0 &&
				prevSelected.length === 1
			) {
				onRowUnselect(prevSelected[0]);
			}

			prevSelectedEntriesRef.current = selectedEntries;
		},
		[selectedEntries],
		1000,
	);

	return (
		<DataTableContext.Provider
			value={{
				dataSource,
				dataStorageKey,
				selectionMode,
				stateDefault,
				dataTableStore,
			}}
		>
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
