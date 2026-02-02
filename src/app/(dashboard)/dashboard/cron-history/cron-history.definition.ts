import { DataTableValue } from '@/app/(dashboard)/_components/data-table-value';
import type { DataTableColumnType } from '@/config/data-source';
import { translateBatch } from '@/config/lang';
import type { CronHistoryModel } from '@/entities/cron-history.model';
import {
	deleteCronHistory,
	findCronHistory,
} from '@/services/cron-history.service';

const translations = await translateBatch([
	'cron_history.data_table.column_id',
	'cron_history.data_table.column_label',
	'cron_history.data_table.column_start_at',
	'cron_history.data_table.column_status',
	'cron_history.data_table.column_run_time',
]);

const DataTableColumnsCronHistory: DataTableColumnType<CronHistoryModel>[] = [
	{
		field: 'id',
		header: translations['cron_history.data_table.column_id'],
		sortable: true,
		body: (entry, column) =>
			DataTableValue<'cron_history'>(entry, column, {
				markDeleted: true,
				action: {
					name: 'view',
					source: 'cron_history',
				},
			}),
	},
	{
		field: 'label',
		header: translations['cron_history.data_table.column_label'],
		sortable: true,
	},
	{
		field: 'start_at',
		header: translations['cron_history.data_table.column_start_at'],
		sortable: true,
		body: (entry, column) =>
			DataTableValue<'cron_history'>(entry, column, {
				displayDate: true,
			}),
	},
	{
		field: 'status',
		header: translations['cron_history.data_table.column_status'],
		body: (entry, column) =>
			DataTableValue<'cron_history'>(entry, column, {
				isStatus: true,
			}),
		style: {
			minWidth: '6rem',
			maxWidth: '6rem',
		},
	},
	{
		field: 'run_time',
		header: translations['cron_history.data_table_column_run_time'],
	},
];

const DataTableCronHistoryFilters = {
	global: { value: null, matchMode: 'contains' },
	status: { value: null, matchMode: 'equals' },
	start_date_start: { value: null, matchMode: 'equals' },
	start_date_end: { value: null, matchMode: 'equals' },
};

export type DataSourceCronHistoryType = {
	tableFilter: typeof DataTableCronHistoryFilters;
	model: CronHistoryModel;
};

export const DataSourceConfigCronHistory = {
	dataTableState: {
		reloadTrigger: 0,
		first: 0,
		rows: 10,
		sortField: 'id',
		sortOrder: -1 as const,
		filters: DataTableCronHistoryFilters,
	},
	dataTableColumns: DataTableColumnsCronHistory,
	functions: {
		find: findCronHistory,
		displayActionEntries: (entries: CronHistoryModel[]) => {
			return entries.map((entry) => ({
				id: entry.id,
				label: entry.label,
			}));
		},
	},
	actions: {
		delete: {
			mode: 'action' as const,
			permission: 'cron_history.delete',
			allowedEntries: 'multiple' as const,
			position: 'left' as const,
			function: deleteCronHistory,
			button: {
				className: 'btn btn-action-delete',
			},
		},
		view: {
			mode: 'other' as const,
			permission: 'cron_history.read',
			allowedEntries: 'single' as const,
			position: 'hidden' as const,
		},
	},
};
