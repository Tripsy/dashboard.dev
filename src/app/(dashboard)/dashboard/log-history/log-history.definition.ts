import { DataTableValue } from '@/app/(dashboard)/_components/data-table-value';
import { ViewLogHistory } from '@/app/(dashboard)/dashboard/log-history/view-log-history.component';
import type {
	DataSourceConfigType,
	DataTableColumnType,
	DataTableValueOptionsType,
} from '@/config/data-source.config';
import { translateBatch } from '@/config/translate.setup';
import { requestDeleteMultiple, requestFind } from '@/helpers/services.helper';
import { toTitleCase } from '@/helpers/string.helper';
import type {
	LogHistoryModel,
	LogHistorySource,
} from '@/models/log-history.model';
import type { FindFunctionParamsType } from '@/types/action.type';

const translations = await translateBatch(
	['delete.title', 'view.title', 'viewUser.title'] as const,
	'log-history.action',
);

export type LogHistoryDataTableFiltersType = {
	request_id: { value: string | null; matchMode: 'contains' };
	entity: { value: string | null; matchMode: 'equals' };
	entity_id: { value: string | null; matchMode: 'equals' };
	action: { value: string | null; matchMode: 'equals' };
	source: { value: LogHistorySource | null; matchMode: 'equals' };
	recorded_at_start: { value: string | null; matchMode: 'equals' };
	recorded_at_end: { value: string | null; matchMode: 'equals' };
};

function displayButtonViewUser(
	entry: LogHistoryModel,
): DataTableValueOptionsType<LogHistoryModel>['displayButton'] {
	if (!entry.auth_id) {
		return undefined;
	}

	return {
		action: 'view',
		dataSource: 'users',
		altTitle: translations['viewUser.title'],
		alternateEntryId: entry.auth_id,
	};
}

export const dataSourceConfigLogHistory: DataSourceConfigType<LogHistoryModel> =
	{
		dataTable: {
			state: {
				first: 0,
				rows: 10,
				sortField: 'id',
				sortOrder: -1 as const,
				filters: {
					request_id: { value: null, matchMode: 'contains' },
					entity: { value: null, matchMode: 'equals' },
					entity_id: { value: null, matchMode: 'equals' },
					action: { value: null, matchMode: 'equals' },
					source: { value: null, matchMode: 'equals' },
					recorded_at_start: { value: null, matchMode: 'equals' },
					recorded_at_end: { value: null, matchMode: 'equals' },
				} satisfies LogHistoryDataTableFiltersType,
			},
			columns: [
				{
					field: 'id',
					header: 'ID',
					sortable: true,
					body: (
						entry: LogHistoryModel,
						column: DataTableColumnType<LogHistoryModel>,
					) =>
						DataTableValue(entry, column, {
							markDeleted: true,
							displayButton: {
								action: 'view',
								dataSource: 'log-history',
							},
						}),
				},
				{
					field: 'request_id',
					header: 'Request ID',
				},
				{
					field: 'entity',
					header: 'Entity',
					sortable: true,
					body: (
						entry: LogHistoryModel,
						column: DataTableColumnType<LogHistoryModel>,
					) =>
						DataTableValue(entry, column, {
							customValue: toTitleCase(entry.entity),
						}),
				},
				{
					field: 'entity_id',
					header: 'Entity ID',
				},
				{
					field: 'action',
					header: 'Action',
					sortable: true,
				},
				{
					field: 'performed_by',
					header: 'Performed By',
					body: (
						entry: LogHistoryModel,
						column: DataTableColumnType<LogHistoryModel>,
					) =>
						DataTableValue(entry, column, {
							customValue: entry.auth_id
								? `${entry.performed_by} (#${entry.auth_id})`
								: entry.performed_by,
							displayButton: displayButtonViewUser(entry),
						}),
				},
				{
					field: 'recorded_at',
					header: 'Recorded At',
					sortable: true,
					body: (
						entry: LogHistoryModel,
						column: DataTableColumnType<LogHistoryModel>,
					) =>
						DataTableValue(entry, column, {
							displayDate: true,
						}),
				},
			],
			find: (params: FindFunctionParamsType) =>
				requestFind<LogHistoryModel>('log-history', params),
		},
		displayEntryLabel: (entry: LogHistoryModel) => {
			return `${entry.entity}-${entry.entity_id}`;
		},
		actions: {
			delete: {
				windowType: 'action',
				windowTitle: translations['delete.title'],
				permission: 'log-history.delete',
				entriesSelection: 'multiple',
				operationFunction: (ids: number[]) =>
					requestDeleteMultiple('log-history', ids),
				buttonPosition: 'left',
				button: {
					variant: 'outline',
					hover: 'error',
				},
			},
			view: {
				windowType: 'view',
				windowTitle: translations['view.title'],
				windowComponent: ViewLogHistory,
				windowConfigProps: {
					size: 'x2l',
				},
				permission: 'log-history.read',
				entriesSelection: 'single',
				buttonPosition: 'hidden',
			},
		},
	};
