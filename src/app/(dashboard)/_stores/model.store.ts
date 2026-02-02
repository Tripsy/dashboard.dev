import type { Draft } from 'immer';
import { create, type StateCreator } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import {
	type DataSourceModel,
	type DataSourceTableFilter,
	type DataSourceType,
	type DataTableStateType,
	getDataSourceConfig,
} from '@/config/data-source';

export interface DataTableSelectionSlice<K extends keyof DataSourceType> {
	selectedEntries: DataSourceModel<K>[];
	setSelectedEntries: (entries: DataSourceModel<K>[]) => void;
	clearSelectedEntries: () => void;
}

export const createDataTableSelectionSlice =
	<K extends keyof DataSourceType>(): StateCreator<
		DataTableStore<K>,
		[['zustand/immer', never]],
		[],
		DataTableSelectionSlice<K>
	> =>
	(set) => ({
		selectedEntries: [],

		setSelectedEntries: (entries) =>
			set((state: Draft<DataTableSelectionSlice<K>>) => {
				state.selectedEntries = entries as Draft<DataSourceModel<K>>[];
			}),

		clearSelectedEntries: () =>
			set((state: Draft<DataTableSelectionSlice<K>>) => {
				state.selectedEntries = [];
			}),
	});

export interface DataTableModalSlice<K extends keyof DataSourceType> {
	isOpen: boolean;
	actionName: string | null;
	actionEntry: DataSourceModel<K> | null;
	setActionEntry: (entry: DataSourceModel<K>) => void;
	openCreate: () => void;
	openUpdate: () => void;
	openAction: (name: string) => void;
	closeOut: () => void;
}

export const createDataTableModalSlice =
	<K extends keyof DataSourceType>(): StateCreator<
		DataTableStore<K>,
		[['zustand/immer', never]],
		[],
		DataTableModalSlice<K>
	> =>
	(set) => ({
		isOpen: false,
		actionName: null,
		actionEntry: null,

		openCreate: () =>
			set((state: Draft<DataTableModalSlice<K>>) => {
				state.isOpen = true;
				state.actionName = 'create';
			}),

		openUpdate: () =>
			set((state: Draft<DataTableModalSlice<K>>) => {
				state.isOpen = true;
				state.actionName = 'update';
			}),

		openAction: (name: string) =>
			set((state: Draft<DataTableModalSlice<K>>) => {
				state.isOpen = true;
				state.actionName = name;
			}),

		setActionEntry: (entry) =>
			set((state: Draft<DataTableModalSlice<K>>) => {
				state.actionEntry = entry as Draft<DataSourceModel<K>>;
			}),

		closeOut: () =>
			set((state: Draft<DataTableModalSlice<K>>) => {
				state.isOpen = false;
				state.actionName = null;
				state.actionEntry = null;
			}),
	});

export interface DataTableSlice<K extends keyof DataSourceType> {
	tableState: DataTableStateType<DataSourceTableFilter<K>>;
	updateTableState: (
		newState: Partial<DataTableStateType<DataSourceTableFilter<K>>>,
	) => void;
	refreshTableState: () => void;
}

export const createDataTableSlice =
	<K extends keyof DataSourceType>(
		dataSource: K,
	): StateCreator<
		DataTableStore<K>,
		[['zustand/immer', never]],
		[],
		DataTableSlice<K>
	> =>
	(set) => ({
		tableState: getDataSourceConfig(dataSource, 'dataTableState'),

		updateTableState: (newState) =>
			set((state: Draft<DataTableSlice<K>>) => {
				state.tableState = {
					...state.tableState,
					...newState,
					filters:
						(newState.filters as Draft<DataSourceTableFilter<K>>) ||
						state.tableState.filters,
				};
			}),

		refreshTableState: () => {
			set((state: Draft<DataTableSlice<K>>) => {
				state.tableState.reloadTrigger =
					(state.tableState.reloadTrigger || 0) + 1;
			});
		},
	});

export type DataTableStore<K extends keyof DataSourceType> =
	DataTableModalSlice<K> &
		DataTableSlice<K> &
		DataTableSelectionSlice<K> & {
			isLoading: boolean;
			setLoading: (loading: boolean) => void;
		};

export const createDataTableStore = <K extends keyof DataSourceType>(
	dataSource: K,
) =>
	create<DataTableStore<K>>()(
		devtools(
			persist(
				immer((set, get, store) => ({
					...createDataTableModalSlice<K>()(set, get, store),
					...createDataTableSlice<K>(dataSource)(set, get, store),
					...createDataTableSelectionSlice<K>()(set, get, store),
					isLoading: false,
					setLoading: (loading: boolean) => {
						set((state) => {
							state.isLoading = loading; // mutable style thanks to immer
						});
					},
				})),
				{
					name: `model-store-${String(dataSource)}`,
					partialize: (state) => ({
						tableState: state.tableState,
						selectedEntries: state.selectedEntries,
					}),
				},
			),
		),
	);

export type DataTableStoreType<K extends keyof DataSourceType> = ReturnType<
	typeof createDataTableStore<K>
>;
