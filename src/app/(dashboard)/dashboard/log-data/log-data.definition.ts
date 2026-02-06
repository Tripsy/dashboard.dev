import {
	type DataTableColumnType,
	DataTableValue,
} from '@/app/(dashboard)/_components/data-table-value';
import {
	type DataTableFiltersType,
	registerDataSource,
} from '@/config/data-source.config';
import { translateBatch } from '@/config/translate.setup';
import type {
	LogCategoryEnum,
	LogDataModel,
	LogLevelEnum,
} from '@/models/log-data.model';
import { deleteLogData, findLogData } from '@/services/log-data.service';

const translations = await translateBatch([
	'log_data.data_table.column_id',
	'log_data.data_table.column_category',
	'log_data.data_table.column_level',
	'log_data.data_table.column_message',
	'log_data.data_table.column_created_at',
]);

export type LogDataDataTableFiltersType = DataTableFiltersType & {
	global: { value: string | null; matchMode: 'contains' };
	level: { value: LogLevelEnum | null; matchMode: 'equals' };
	category: { value: LogCategoryEnum | null; matchMode: 'equals' };
	create_date_start: { value: string | null; matchMode: 'equals' };
	create_date_end: { value: string | null; matchMode: 'equals' };
};

export const logDataDataTableFilters: LogDataDataTableFiltersType = {
	global: { value: null, matchMode: 'contains' },
	level: { value: null, matchMode: 'equals' },
	category: { value: null, matchMode: 'equals' },
	create_date_start: { value: null, matchMode: 'equals' },
	create_date_end: { value: null, matchMode: 'equals' },
};

const dataSourceConfigLogData = {
	dataTableState: {
		reloadTrigger: 0,
		first: 0,
		rows: 10,
		sortField: 'id',
		sortOrder: -1 as const,
		filters: logDataDataTableFilters,
	},
	dataTableColumns: [
		{
			field: 'id',
			header: translations['log_data.data_table.column_id'],
			sortable: true,
			body: (
				entry: LogDataModel,
				column: DataTableColumnType<LogDataModel>,
			) =>
				DataTableValue(entry, column, {
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
			body: (
				entry: LogDataModel,
				column: DataTableColumnType<LogDataModel>,
			) =>
				DataTableValue(entry, column, {
					capitalize: true,
				}),
		},
		{
			field: 'level',
			header: translations['log_data.data_table.column_level'],
			sortable: true,
			body: (
				entry: LogDataModel,
				column: DataTableColumnType<LogDataModel>,
			) =>
				DataTableValue(entry, column, {
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
			body: (
				entry: LogDataModel,
				column: DataTableColumnType<LogDataModel>,
			) =>
				DataTableValue(entry, column, {
					displayDate: true,
				}),
		},
	],
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

registerDataSource('log-data', dataSourceConfigLogData);
