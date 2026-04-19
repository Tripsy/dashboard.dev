import { DataTableValue } from '@/app/(dashboard)/_components/data-table-value';
import { ViewLogData } from '@/app/(dashboard)/dashboard/log-data/view-log-data.component';
import type {
	DataSourceConfigType,
	DataTableColumnType,
} from '@/config/data-source.config';
import { translateBatch } from '@/config/translate.setup';
import { requestDeleteMultiple, requestFind } from '@/helpers/services.helper';
import type {
	LogCategoryEnum,
	LogDataModel,
	LogLevelEnum,
} from '@/models/log-data.model';
import type { FindFunctionParamsType } from '@/types/action.type';

const translations = await translateBatch(
	['view.title', 'delete.title'],
	'log-data.action',
);

export type LogDataDataTableFiltersType = {
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

export const dataSourceConfigLogData: DataSourceConfigType<LogDataModel> = {
	dataTable: {
		state: {
			first: 0,
			rows: 10,
			sortField: 'id',
			sortOrder: -1 as const,
			filters: logDataDataTableFilters,
		},
		columns: [
			{
				field: 'id',
				header: 'ID',
				sortable: true,
				body: (
					entry: LogDataModel,
					column: DataTableColumnType<LogDataModel>,
				) =>
					DataTableValue(entry, column, {
						markDeleted: true,
						displayButton: {
							action: 'view',
							dataSource: 'log-data',
						},
					}),
			},
			{
				field: 'category',
				header: 'Category',
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
				header: 'Level',
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
				header: 'Message',
			},
			{
				field: 'created_at',
				header: 'Created At',
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
		find: (params: FindFunctionParamsType) =>
			requestFind<LogDataModel>('log-data', params),
	},
	displayEntryLabel: (entry: LogDataModel) => {
		return entry.pid;
	},
	actions: {
		delete: {
			windowType: 'action',
			windowTitle: translations['delete.title'],
			permission: 'log-data.delete',
			entriesSelection: 'multiple',
			operationFunction: (ids: number[]) =>
				requestDeleteMultiple('log-data', ids),
			buttonPosition: 'left',
			button: {
				variant: 'outline',
				hover: 'error',
			},
		},
		view: {
			windowType: 'view',
			windowTitle: translations['view.title'],
			windowComponent: ViewLogData,
			windowConfigProps: {
				size: 'x3l',
			},
			permission: 'log-data.read',
			entriesSelection: 'single',
			buttonPosition: 'hidden',
		},
	},
};
