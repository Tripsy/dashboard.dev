import type { Draft } from 'immer';
import { create, type StateCreator } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import {
	type DataSourceKey,
	type DataTableFiltersType,
	type DataTableStateType,
	getDataSourceConfig,
} from '@/config/data-source.config';
import { registerDashboardDataSource } from '@/config/data-source.dashboard.register';

registerDashboardDataSource();

export interface DataTableModalSlice<Model> {
	isOpen: boolean;
	actionName: string | null;
	actionEntry: Model | null;
	setActionEntry: (entry: Model) => void;
	openCreate: () => void;
	openUpdate: () => void;
	openAction: (name: string) => void;
	closeOut: () => void;
}

export const createDataTableModalSlice =
	<Model>(): StateCreator<
		DataTableStore<Model>,
		[['zustand/immer', never]],
		[],
		DataTableModalSlice<Model>
	> =>
	(set) => ({
		isOpen: false,
		actionName: null,
		actionEntry: null,

		openCreate: () =>
			set((state: Draft<DataTableModalSlice<Model>>) => {
				state.isOpen = true;
				state.actionName = 'create';
			}),

		openUpdate: () =>
			set((state: Draft<DataTableModalSlice<Model>>) => {
				state.isOpen = true;
				state.actionName = 'update';
			}),

		openAction: (name: string) =>
			set((state: Draft<DataTableModalSlice<Model>>) => {
				state.isOpen = true;
				state.actionName = name;
			}),

		setActionEntry: (entry) =>
			set((state: Draft<DataTableModalSlice<Model>>) => {
				// biome-ignore lint/suspicious/noExplicitAny: This cast is safe because Immer handles drafting at runtime.
				state.actionEntry = entry as any;
			}),

		closeOut: () =>
			set((state: Draft<DataTableModalSlice<Model>>) => {
				state.isOpen = false;
				state.actionName = null;
				// biome-ignore lint/suspicious/noExplicitAny: This cast is safe because Immer handles drafting at runtime.
				state.actionEntry = null as any;
			}),
	});

export interface DataTableSlice {
	tableState: DataTableStateType;
	updateTableState: (newState: Partial<DataTableStateType>) => void;
	refreshTableState: () => void;
}

export const createDataTableSlice =
	<K extends DataSourceKey, Model>(
		dataSource: K,
	): StateCreator<
		DataTableStore<Model>,
		[['zustand/immer', never]],
		[],
		DataTableSlice
	> =>
	(set) => ({
		tableState: getDataSourceConfig(dataSource, 'dataTableState'),

		updateTableState: (newState) =>
			set((state: Draft<DataTableSlice>) => {
				state.tableState = {
					...state.tableState,
					...newState,
					filters:
						(newState.filters as Draft<DataTableFiltersType>) ||
						state.tableState.filters,
				};
			}),

		refreshTableState: () => {
			set((state: Draft<DataTableSlice>) => {
				state.tableState.reloadTrigger =
					(state.tableState.reloadTrigger || 0) + 1;
			});
		},
	});

export interface DataTableSelectionSlice<Model> {
	selectedEntries: Model[];
	setSelectedEntries: (entries: Model[]) => void;
	clearSelectedEntries: () => void;
}

export const createDataTableSelectionSlice =
	<Model>(): StateCreator<
		DataTableStore<Model>,
		[['zustand/immer', never]],
		[],
		DataTableSelectionSlice<Model>
	> =>
	(set) => ({
		selectedEntries: [],

		setSelectedEntries: (entries) =>
			set((state: Draft<DataTableSelectionSlice<Model>>) => {
				state.selectedEntries = entries as Draft<Model>[];
			}),

		clearSelectedEntries: () =>
			set((state: Draft<DataTableSelectionSlice<Model>>) => {
				state.selectedEntries = [];
			}),
	});

export type DataTableStore<Model> = DataTableModalSlice<Model> &
	DataTableSlice &
	DataTableSelectionSlice<Model> & {
		isLoading: boolean;
		setLoading: (loading: boolean) => void;
	};

export const createDataTableStore = <K extends DataSourceKey, Model>(
	dataSource: K,
) =>
	create<DataTableStore<Model>>()(
		devtools(
			persist(
				immer((set, get, store) => ({
					...createDataTableModalSlice<Model>()(set, get, store),
					...createDataTableSlice<K, Model>(dataSource)(
						set,
						get,
						store,
					),
					...createDataTableSelectionSlice<Model>()(set, get, store),
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

export type DataTableStoreType<K extends DataSourceKey, Model> = ReturnType<
	typeof createDataTableStore<K, Model>
>;
