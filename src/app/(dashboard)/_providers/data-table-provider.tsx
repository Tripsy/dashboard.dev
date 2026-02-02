'use client';

import {
	createContext,
	type ReactNode,
	useContext,
	useMemo,
	useRef,
} from 'react';
import { useStore } from 'zustand/react';
import type { ModelStoreType } from '@/app/(dashboard)/_stores/model.store';
import {
	type DataSourceModel,
	type DataSourceTableFilter,
	type DataSourceType,
	type DataTableSelectionModeType,
	type DataTableStateType,
	getDataSourceConfig,
} from '@/config/data-source';
import { useDebouncedEffect } from '@/hooks';

type DataTableContextType<K extends keyof DataSourceType> = {
	dataSource: K;
	dataStorageKey: string;
	selectionMode: DataTableSelectionModeType;
	stateDefault: DataTableStateType<DataSourceTableFilter<K>>;
	modelStore: ModelStoreType<K>;
};

const DataTableContext = createContext<
	DataTableContextType<keyof DataSourceType> | undefined
>(undefined);

function DataTableProvider<K extends keyof DataSourceType>({
	dataSource,
	selectionMode,
	modelStore,
	children,
}: {
	dataSource: K;
	selectionMode: DataTableSelectionModeType;
	modelStore: ModelStoreType<K>;
	children: ReactNode;
}) {
	const dataStorageKey = useMemo(
		() => `data-table-state-${dataSource}`,
		[dataSource],
	);
	const stateDefault = getDataSourceConfig(dataSource, 'dataTableState');

	const selectedEntries = useStore(
		modelStore,
		(state) => state.selectedEntries,
	);

	const prevSelectedEntriesRef = useRef<DataSourceModel<K>[]>([]);

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
				modelStore,
			}}
		>
			{children}
		</DataTableContext.Provider>
	);
}

function useDataTable<K extends keyof DataSourceType>() {
	const context = useContext(DataTableContext) as
		| DataTableContextType<K>
		| undefined;

	if (!context) {
		throw new Error('useDataTable must be used within a DataTableProvider');
	}

	return context;
}

export { DataTableProvider, useDataTable };
