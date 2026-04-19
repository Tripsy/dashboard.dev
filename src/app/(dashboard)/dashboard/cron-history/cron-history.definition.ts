import { DataTableValue } from '@/app/(dashboard)/_components/data-table-value';
import { ViewCronHistory } from '@/app/(dashboard)/dashboard/cron-history/view-cron-history.component';
import type {
	DataSourceConfigType,
	DataTableColumnType,
} from '@/config/data-source.config';
import { translateBatch } from '@/config/translate.setup';
import { requestDeleteMultiple, requestFind } from '@/helpers/services.helper';
import type {
	CronHistoryModel,
	CronHistoryStatusEnum,
} from '@/models/cron-history.model';
import type { FindFunctionParamsType } from '@/types/action.type';

const translations = await translateBatch(
	['view.title', 'delete.title'],
	'cron-history.action',
);

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

export const dataSourceConfigCronHistory: DataSourceConfigType<CronHistoryModel> =
	{
		dataTable: {
			state: {
				first: 0,
				rows: 10,
				sortField: 'id',
				sortOrder: -1 as const,
				filters: cronHistoryDataTableFilters,
			},
			columns: [
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
							displayButton: {
								action: 'view',
								dataSource: 'cron-history',
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
			find: (params: FindFunctionParamsType) =>
				requestFind<CronHistoryModel>('cron-history', params),
		},
		displayEntryLabel: (entry: CronHistoryModel) => {
			return entry.label;
		},
		actions: {
			delete: {
				windowType: 'action',
				windowTitle: translations['delete.title'],
				permission: 'cron-history.delete',
				entriesSelection: 'multiple',
				operationFunction: (ids: number[]) =>
					requestDeleteMultiple('cron-history', ids),
				buttonPosition: 'left',
				button: {
					variant: 'outline',
					hover: 'error',
				},
			},
			view: {
				windowType: 'view',
				windowTitle: translations['view.title'],
				windowComponent: ViewCronHistory,
				windowConfigProps: {
					size: 'x2l',
				},
				permission: 'cron-history.read',
				entriesSelection: 'single',
				buttonPosition: 'hidden',
			},
		},
	};
