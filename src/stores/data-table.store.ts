import type { Draft } from 'immer';
import { create, type StateCreator } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import {
	type DataSourceKey,
	type DataSourceSection,
	type DataTableFiltersType,
	type DataTableStateType,
	getDataSourceConfig,
} from '@/config/data-source.config';

// ============================================================================
// TABLE SLICE
// ============================================================================

export interface DataTableSlice {
	tableState: DataTableStateType;
	updateTableState: (newState: Partial<DataTableStateType>) => void;
}

export const createDataTableSlice =
	<K extends DataSourceKey>(
		section: DataSourceSection,
		dataSource: K,
	): StateCreator<
		DataTableStore,
		[['zustand/immer', never]],
		[],
		DataTableSlice
	> =>
	(set) => ({
		tableState: structuredClone(
			getDataSourceConfig(section, dataSource, 'dataTable').state,
		),

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
	});

// ============================================================================
// SELECTION SLICE
// ============================================================================

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

// ============================================================================
// STORE
// ============================================================================

// biome-ignore lint/suspicious/noExplicitAny: It's fine
export type DataTableStore<Model = any> = DataTableSlice &
	DataTableSelectionSlice<Model> & {
		isLoading: boolean;
		setLoading: (loading: boolean) => void;
	};

export const createDataTableStore = <K extends DataSourceKey, Model>(
	section: DataSourceSection,
	dataSource: K,
) =>
	create<DataTableStore<Model>>()(
		devtools(
			persist(
				immer((set, get, store) => ({
					...createDataTableSlice<K>(section, dataSource)(
						set,
						get,
						store,
					),
					...createDataTableSelectionSlice<Model>()(set, get, store),

					isLoading: false,
					setLoading: (loading: boolean) => {
						set((state) => {
							state.isLoading = loading;
						});
					},
				})),
				{
					name: `datatable-store-${String(section)}-${String(dataSource)}`,
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
