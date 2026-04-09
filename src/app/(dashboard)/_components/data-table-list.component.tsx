'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { Column } from 'primereact/column';
import {
	DataTable,
	type DataTablePageEvent,
	type DataTableSortEvent,
	type DataTableValue,
} from 'primereact/datatable';
import type { PaginatorCurrentPageReportOptions } from 'primereact/paginator';
import type React from 'react';
import { useCallback, useEffect, useMemo } from 'react';
import { useStore } from 'zustand/react';
import { useDataTable } from '@/app/(dashboard)/_providers/data-table.provider';
import { LoadingComponent } from '@/components/status.component';
import {
	type DataTableFiltersType,
	getDataSourceConfig,
} from '@/config/data-source.config';
import { toDateInstanceCustom } from '@/helpers/date.helper';
import { replaceVars } from '@/helpers/string.helper';
import { useTranslation } from '@/hooks/use-translation.hook';
import type { QueryFiltersType } from '@/types/api.type';

function findFunctionFilter(filters: DataTableFiltersType): QueryFiltersType {
	return Object.entries(filters).reduce((acc, [key, filter]) => {
		const { value } = filter;

		// Skip empty values
		if (value === null || value === undefined || value === '') {
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
				throw new Error(`Invalid end date: ${value}`);
			}

			acc[key] = date.endOf('day').toISOString();
		} else {
			// Convert key 'global' to 'term' for search
			const newKey = key === 'global' ? 'term' : key;
			acc[newKey] = String(value);
		}

		return acc;
	}, {} as QueryFiltersType);
}

type SelectionChangeEvent<T> = {
	originalEvent: React.SyntheticEvent;
	value: T[];
};

export default function DataTableList<Model extends DataTableValue>(props: {
	dataKey: string;
	scrollHeight?: string;
}) {
	const { dataSource, dataStorageKey, selectionMode, dataTableStore } =
		useDataTable();

	const {
		tableState,
		updateTableState,
		selectedEntries,
		setSelectedEntries,
		clearSelectedEntries,
	} = useStore(dataTableStore, (state) => state);

	const translationsKeys = useMemo(
		() =>
			[
				'dashboard.text.no_entries',
				'dashboard.text.showing_entries',
			] as const,
		[],
	);

	const { isTranslationLoading, translations } =
		useTranslation(translationsKeys);

	const dataTable = useMemo(
		() => getDataSourceConfig(dataSource, 'dataTable'),
		[dataSource],
	);

	// biome-ignore lint/correctness/useExhaustiveDependencies: Reset to first page when filters change
	useEffect(() => {
		clearSelectedEntries();

		updateTableState({
			first: 0,
		});
	}, [clearSelectedEntries, updateTableState, tableState.filters]);

	const queryKey = useMemo(
		() => [
			'dataTable',
			dataSource,
			tableState.first,
			tableState.rows,
			tableState.sortField,
			tableState.sortOrder,
			tableState.filters,
		],
		[dataSource, tableState],
	);

	const { data, isLoading } = useQuery({
		queryKey,
		queryFn: async () => {
			const response = await dataTable.find({
				order_by: tableState.sortField,
				direction: tableState.sortOrder === 1 ? 'ASC' : 'DESC',
				limit: tableState.rows,
				page:
					tableState.rows > 0
						? Math.floor(tableState.first / tableState.rows) + 1
						: 1,
				filter: findFunctionFilter(tableState.filters),
			});

			if (!response) {
				throw new Error(`Could not retrieve ${dataSource} data`);
			}

			return response;
		},
		placeholderData: keepPreviousData,
	});

	const entries = data?.entries ?? [];
	const totalRecords = data?.pagination.total ?? 0;

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
		(event: SelectionChangeEvent<Model>) => {
			setSelectedEntries(event.value);
		},
		[setSelectedEntries],
	);

	const tableColumns = useMemo(
		() =>
			dataTable.columns.map((column) => (
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
		[dataTable.columns],
	);

	const paginatorTemplate = useMemo(
		() => ({
			layout: 'CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown',
			CurrentPageReport: (options: PaginatorCurrentPageReportOptions) => (
				<div className="data-table-paginator-showing">
					{replaceVars(
						translations['dashboard.text.showing_entries'],
						{
							first: options.first.toString(),
							last: options.last.toString(),
							total: options.totalRecords.toString(),
						},
					)}
				</div>
			),
		}),
		[translations],
	);

	if (isTranslationLoading) {
		return <LoadingComponent />;
	}

	return (
		<DataTable
			emptyMessage={translations['dashboard.text.no_entries']}
			value={entries}
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
			scrollHeight={props.scrollHeight}
			resizableColumns
			reorderableColumns
			stateStorage="local"
			stateKey={dataStorageKey}
			filters={tableState.filters}
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
