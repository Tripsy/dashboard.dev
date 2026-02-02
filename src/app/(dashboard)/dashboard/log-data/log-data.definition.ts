import { DataTableValue } from '@/app/(dashboard)/_components/data-table-value';
import type { DataTableColumnType } from '@/config/data-source';
import { translateBatch } from '@/config/lang';
import type { LogDataModel } from '@/entities/log-data.model';
import { deleteLogData, findLogData } from '@/services/log-data.service';

const translations = await translateBatch([
	'log_data.data_table.column_id',
	'log_data.data_table.column_category',
	'log_data.data_table.column_level',
	'log_data.data_table.column_message',
	'log_data.data_table.column_created_at',
]);

const DataTableColumnsLogData: DataTableColumnType<LogDataModel>[] = [
	{
		field: 'id',
		header: translations['log_data.data_table.column_id'],
		sortable: true,
		body: (entry, column) =>
			DataTableValue<'log_data'>(entry, column, {
				markDeleted: true,
				action: {
					name: 'view',
					source: 'log_data',
				},
			}),
	},
	{
		field: 'category',
		header: translations['log_data.data_table.column_category'],
		sortable: true,
		body: (entry, column) =>
			DataTableValue<'log_data'>(entry, column, {
				capitalize: true,
			}),
	},
	{
		field: 'level',
		header: translations['log_data.data_table.column_level'],
		sortable: true,
		body: (entry, column) =>
			DataTableValue<'log_data'>(entry, column, {
				capitalize: true,
			}),
	},
	{
		field: 'message',
		header: translations['log_data.data_table.column_message'],
	},
	{
		field: 'created_at',
		header: translations['log_data.data_table.column_created_at'],
		sortable: true,
		body: (entry, column) =>
			DataTableValue<'log_data'>(entry, column, {
				displayDate: true,
			}),
	},
];

const DataTableLogDataFilters = {
	global: { value: null, matchMode: 'contains' },
	level: { value: null, matchMode: 'equals' },
	category: { value: null, matchMode: 'equals' },
	create_date_start: { value: null, matchMode: 'equals' },
	create_date_end: { value: null, matchMode: 'equals' },
};

export type DataSourceLogDataType = {
	tableFilter: typeof DataTableLogDataFilters;
	model: LogDataModel;
};

export const DataSourceConfigLogData = {
	dataTableState: {
		reloadTrigger: 0,
		first: 0,
		rows: 10,
		sortField: 'id',
		sortOrder: -1 as const,
		filters: DataTableLogDataFilters,
	},
	dataTableColumns: DataTableColumnsLogData,
	functions: {
		find: findLogData,
		displayActionEntries: (entries: LogDataModel[]) => {
			return entries.map((entry) => ({
				id: entry.id,
				label: entry.pid,
			}));
		},
	},
	actions: {
		delete: {
			mode: 'action' as const,
			permission: 'log_data.delete',
			allowedEntries: 'multiple' as const,
			position: 'left' as const,
			function: deleteLogData,
			button: {
				className: 'btn btn-action-delete',
			},
		},
		view: {
			mode: 'other' as const,
			permission: 'log_data.read',
			allowedEntries: 'single' as const,
			position: 'hidden' as const,
		},
	},
};
