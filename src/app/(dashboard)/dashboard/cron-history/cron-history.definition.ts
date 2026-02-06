import {
	type DataTableColumnType,
	DataTableValue,
} from '@/app/(dashboard)/_components/data-table-value';
import type { DataTableFiltersType } from '@/config/data-source.config';
import { translateBatch } from '@/config/translate.setup';
import type {
	CronHistoryModel,
	CronHistoryStatusEnum,
} from '@/models/cron-history.model';
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

export type CronHistoryDataTableFiltersType = DataTableFiltersType & {
	global: { value: string | null; matchMode: 'contains' };
	status: { value: CronHistoryStatusEnum | null; matchMode: 'equals' };
	start_date_start: { value: string | null; matchMode: 'equals' };
	start_date_end: { value: string | null; matchMode: 'equals' };
};

export const cronHistoryDataTableFilters: CronHistoryDataTableFiltersType = {
	global: { value: null, matchMode: 'contains' },
	status: { value: null, matchMode: 'equals' },
	start_date_start: { value: null, matchMode: 'equals' },
	start_date_end: { value: null, matchMode: 'equals' },
};

export const dataSourceConfigCronHistory = {
	dataTableState: {
		reloadTrigger: 0,
		first: 0,
		rows: 10,
		sortField: 'id',
		sortOrder: -1 as const,
		filters: cronHistoryDataTableFilters,
	},
	dataTableColumns: [
		{
			field: 'id',
			header: translations['cron_history.data_table.column_id'],
			sortable: true,
			body: (
				entry: CronHistoryModel,
				column: DataTableColumnType<CronHistoryModel>,
			) =>
				DataTableValue(entry, column, {
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
			body: (
				entry: CronHistoryModel,
				column: DataTableColumnType<CronHistoryModel>,
			) =>
				DataTableValue(entry, column, {
					displayDate: true,
				}),
		},
		{
			field: 'status',
			header: translations['cron_history.data_table.column_status'],
			body: (
				entry: CronHistoryModel,
				column: DataTableColumnType<CronHistoryModel>,
			) =>
				DataTableValue(entry, column, {
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
	],
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
