'use client';

import { Column } from 'primereact/column';
import {
	DataTable,
	type DataTableFilterMeta,
	type DataTablePageEvent,
	type DataTableSortEvent,
	type DataTableValue,
} from 'primereact/datatable';
import type { PaginatorCurrentPageReportOptions } from 'primereact/paginator';
import type React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useStore } from 'zustand/react';
import { useDataTable } from '@/app/(dashboard)/_providers/data-table-provider';
import {
	type FindFunctionResponseType,
	getDataSourceConfig,
} from '@/config/data-source';
import { toDateInstanceCustom } from '@/helpers/date.helper';
import { replaceVars } from '@/helpers/string.helper';
import { useTranslation } from '@/hooks/use-translation.hook';

type SelectionChangeEvent<T> = {
	originalEvent: React.SyntheticEvent;
	value: T[];
};

const CurrentPageReport = (options: PaginatorCurrentPageReportOptions) => {
	const translationsKeys = useMemo(
		() => ['dashboard.text.showing_entries'] as const,
		[],
	);

	const { translations, isTranslationLoading } =
		useTranslation(translationsKeys);

	if (isTranslationLoading) {
		return (
			<div className="data-table-paginator-showing">
				Showing {options.first} to {options.last} of{' '}
				{options.totalRecords} entries
			</div>
		);
	}

	return (
		<div className="data-table-paginator-showing">
			{replaceVars(translations['dashboard.text.showing_entries'], {
				first: options.first.toString(),
				last: options.last.toString(),
				total: options.totalRecords.toString(),
			})}
		</div>
	);
};

export default function DataTableList<Entity extends DataTableValue>(props: {
	dataKey: string;
	scrollHeight?: string;
}) {
	const { dataSource, dataStorageKey, selectionMode, dataTableStore } =
		useDataTable();

	const tableState = useStore(dataTableStore, (state) => state.tableState);
	const updateTableState = useStore(
		dataTableStore,
		(state) => state.updateTableState,
	);
	const selectedEntries = useStore(
		dataTableStore,
		(state) => state.selectedEntries,
	) as Entity[];
	const setSelectedEntries = useStore(
		dataTableStore,
		(state) => state.setSelectedEntries,
	);
	const clearSelectedEntries = useStore(
		dataTableStore,
		(state) => state.clearSelectedEntries,
	);
	const isLoading = useStore(dataTableStore, (state) => state.isLoading);
	const setLoading = useStore(dataTableStore, (state) => state.setLoading);

	const [data, setData] = useState<Entity[]>([]);
	const [totalRecords, setTotalRecords] = useState(0);

	const translationsKeys = useMemo(
		() => ['dashboard.text.no_entries'] as const,
		[],
	);

	const { translations } = useTranslation(translationsKeys);

	// biome-ignore lint/correctness/useExhaustiveDependencies: Reset to first page when filters change
	useEffect(() => {
		clearSelectedEntries();

		updateTableState({
			first: 0,
		});
	}, [clearSelectedEntries, updateTableState, tableState.filters]);

	const findFunctionFilter = useMemo(() => {
		// Type guard to ensure filters is a proper object
		if (
			!tableState.filters ||
			typeof tableState.filters !== 'object' ||
			Array.isArray(tableState.filters)
		) {
			return JSON.stringify({});
		}

		const params = Object.entries(
			tableState.filters as Record<string, unknown>,
		).reduce(
			(acc, [key, filterObj]) => {
				// Additional type check for filterObj
				if (
					!filterObj ||
					typeof filterObj !== 'object' ||
					Array.isArray(filterObj)
				) {
					return acc;
				}

				const value = (filterObj as { value?: unknown }).value;

				// Skip empty or null values
				if (value == null || value === '') {
					return acc;
				}

				// Handle date filters
				if (/_date_start$/.test(key)) {
					const date = toDateInstanceCustom(value as string);

					if (!date) {
						throw new Error(`Invalid start date: ${value}`);
					}

					acc[key] = date.startOf('day').toISOString();
				} else if (/_date_end$/.test(key)) {
					const date = toDateInstanceCustom(value as string);

					if (!date) {
						throw new Error(`Invalid start date: ${value}`);
					}

					acc[key] = date.endOf('day').toISOString();
				} else {
					acc[key === 'global' ? 'term' : String(key)] =
						String(value);
				}

				return acc;
			},
			{} as Record<string, string>,
		);

		return JSON.stringify(params);
	}, [tableState.filters]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: `tableState.reloadTrigger` is actually required as part of functionality
	useEffect(() => {
		const abortController = new AbortController();

		(async () => {
			try {
				setLoading(true);

				const loadLazyData = async (signal?: AbortSignal) => {
					if (signal?.aborted) {
						return;
					} // Don't proceed if already aborted

					const functions = getDataSourceConfig(
						dataSource,
						'functions',
					);
					const findFunction = functions?.find;

					if (!findFunction) {
						throw new Error(
							`No fetch function found for ${dataSource}`,
						);
					}

					const data = (await findFunction({
						order_by: tableState.sortField,
						direction: tableState.sortOrder === 1 ? 'ASC' : 'DESC',
						limit: tableState.rows,
						page:
							tableState.rows > 0
								? Math.floor(
										tableState.first / tableState.rows,
									) + 1
								: 1,
						filter: findFunctionFilter,
					})) as FindFunctionResponseType<Entity>;

					if (signal?.aborted) {
						return;
					} // Don't proceed if already aborted

					if (!data) {
						throw new Error(
							`Could not retrieve ${dataSource} data`,
						);
					}

					return data;
				};

				const response = await loadLazyData(abortController.signal);

				if (response && !abortController.signal.aborted) {
					setData(response.entries);
					setTotalRecords(response.pagination.total);
				}
			} catch (error) {
				if (!abortController.signal.aborted) {
					throw error;
				}
			} finally {
				if (!abortController.signal.aborted) {
					setLoading(false);
				}
			}
		})();

		return () => {
			abortController.abort();
		};
	}, [
		dataSource,
		tableState.sortField,
		tableState.sortOrder,
		tableState.rows,
		tableState.first,
		findFunctionFilter,
		setLoading,
		tableState.reloadTrigger,
	]);

	const onPage = useCallback(
		(event: DataTablePageEvent) => {
			clearSelectedEntries();

			updateTableState({
				first: event.first,
				rows: event.rows,
			});
		},
		[clearSelectedEntries, updateTableState],
	);

	const onSort = useCallback(
		(event: DataTableSortEvent) => {
			clearSelectedEntries();

			updateTableState({
				first: 0,
				sortField: event.sortField,
				sortOrder: event.sortOrder,
			});
		},
		[clearSelectedEntries, updateTableState],
	);

	const onSelectionChange = useCallback(
		(event: SelectionChangeEvent<Entity>) => {
			setSelectedEntries(event.value);
		},
		[setSelectedEntries],
	);

	const columns = getDataSourceConfig(dataSource, 'dataTableColumns');

	const tableColumns = useMemo(
		() =>
			columns.map((column) => (
				<Column
					key={column.field}
					field={column.field}
					header={column.header}
					style={column.style}
					sortable={column.sortable ?? false}
					body={(rowData) =>
						column.body
							? column.body(rowData, column)
							: rowData[column.field]
					}
				/>
			)),
		[columns],
	);

	const paginatorTemplate = useMemo(
		() => ({
			layout: 'CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown',
			CurrentPageReport,
		}),
		[],
	);

	return (
		<DataTable
			emptyMessage={translations['dashboard.text.no_entries']}
			value={data}
			lazy
			dataKey={props.dataKey}
			selectionMode={selectionMode}
			selection={selectedEntries}
			metaKeySelection={false}
			selectionPageOnly={true}
			onSelectionChange={onSelectionChange}
			first={tableState.first}
			rows={tableState.rows}
			totalRecords={totalRecords}
			onPage={onPage}
			onSort={onSort}
			sortField={tableState.sortField}
			sortOrder={tableState.sortOrder}
			loading={isLoading}
			stripedRows
			scrollable
			scrollHeight={props.scrollHeight || 'flex'}
			resizableColumns
			reorderableColumns
			stateStorage="local"
			stateKey={dataStorageKey}
			filters={tableState.filters as DataTableFilterMeta}
			paginator
			rowsPerPageOptions={[5, 10, 25, 50]}
			paginatorTemplate={paginatorTemplate}
			paginatorClassName="data-table-paginator"
		>
			{selectionMode === 'multiple' && (
				<Column
					selectionMode="multiple"
					headerStyle={{ width: '1rem' }}
				/>
			)}

			{tableColumns}
		</DataTable>
	);
}
