import {
	type DataTableColumnType,
	DataTableValue,
} from '@/app/(dashboard)/_components/data-table-value';
import { ViewCronHistory } from '@/app/(dashboard)/dashboard/cron-history/view-cron-history.component';
import type {
	CronHistoryModel,
	CronHistoryStatusEnum,
} from '@/models/cron-history.model';
import {
	deleteCronHistory,
	findCronHistory,
} from '@/services/cron-history.service';

export type CronHistoryDataTableFiltersType = {
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
		first: 0,
		rows: 10,
		sortField: 'id',
		sortOrder: -1 as const,
		filters: cronHistoryDataTableFilters,
	},
	dataTableColumns: [
		{
			field: 'id',
			header: 'ID',
			sortable: true,
			body: (
				entry: CronHistoryModel,
				column: DataTableColumnType<CronHistoryModel>,
			) =>
				DataTableValue(entry, column, {
					markDeleted: true,
					action: {
						name: 'view',
						source: 'cron-history',
					},
				}),
		},
		{
			field: 'label',
			header: 'Label',
			sortable: true,
		},
		{
			field: 'start_at',
			header: 'Start At',
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
			header: 'Status',
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
			header: 'Run time',
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
			windowType: 'action' as const,
			permission: 'cron-history.delete',
			entriesSelection: 'multiple' as const,
			actionPosition: 'left' as const,
			operationFunction: deleteCronHistory,
			button: {
				variant: 'outline' as const,
				hover: 'error' as const,
			},
		},
		view: {
			windowType: 'view' as const,
			component: ViewCronHistory,
			modalProps: {
				size: 'x2l' as const,
			},
			permission: 'cron-history.read',
			entriesSelection: 'single' as const,
			actionPosition: 'hidden' as const,
		},
	},
};
