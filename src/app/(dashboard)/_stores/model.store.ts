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
				state.actionEntry = entry as Draft<Model>;
			}),

		closeOut: () =>
			set((state: Draft<DataTableModalSlice<Model>>) => {
				state.isOpen = false;
				state.actionName = null;
				state.actionEntry = null;
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

export interface DataTableSelectionSlice<Entity> {
	selectedEntries: Entity[];
	setSelectedEntries: (entries: Entity[]) => void;
	clearSelectedEntries: () => void;
}

export const createDataTableSelectionSlice =
	<Entity>(): StateCreator<
		DataTableStore<Entity>,
		[['zustand/immer', never]],
		[],
		DataTableSelectionSlice<Entity>
	> =>
	(set) => ({
		selectedEntries: [],

		setSelectedEntries: (entries) =>
			set((state: Draft<DataTableSelectionSlice<Entity>>) => {
				state.selectedEntries = entries as Draft<Entity>[];
			}),

		clearSelectedEntries: () =>
			set((state: Draft<DataTableSelectionSlice<Entity>>) => {
				state.selectedEntries = [];
			}),
	});

export type DataTableStore<Entity> = DataTableModalSlice<Entity> &
	DataTableSlice &
	DataTableSelectionSlice<Entity> & {
		isLoading: boolean;
		setLoading: (loading: boolean) => void;
	};

export const createDataTableStore = <K extends DataSourceKey, Entity>(
	dataSource: K,
) =>
	create<DataTableStore<Entity>>()(
		devtools(
			persist(
				immer((set, get, store) => ({
					...createDataTableModalSlice<Entity>()(set, get, store),
					...createDataTableSlice<K, Entity>(dataSource)(
						set,
						get,
						store,
					),
					...createDataTableSelectionSlice<Entity>()(set, get, store),
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

export type DataTableStoreType<K extends DataSourceKey, Entity> = ReturnType<
	typeof createDataTableStore<K, Entity>
>;
