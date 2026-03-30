import {
	type DataTableColumnType,
	DataTableValue,
} from '@/app/(dashboard)/_components/data-table-value';
import { ViewLogHistory } from '@/app/(dashboard)/dashboard/log-history/view-log-history.component';
import { ViewUser } from '@/app/(dashboard)/dashboard/users/view-user.component';
import { toTitleCase } from '@/helpers/string.helper';
import type {
	LogHistoryModel,
	LogHistorySource,
} from '@/models/log-history.model';
import {
	deleteLogHistory,
	findLogHistory,
} from '@/services/log-history.service';
import { getUser } from '@/services/users.service';

export type LogHistoryDataTableFiltersType = {
	request_id: { value: string | null; matchMode: 'contains' };
	entity: { value: string | null; matchMode: 'equals' };
	entity_id: { value: string | null; matchMode: 'equals' };
	action: { value: string | null; matchMode: 'equals' };
	source: { value: LogHistorySource | null; matchMode: 'equals' };
	recorded_at_start: { value: string | null; matchMode: 'equals' };
	recorded_at_end: { value: string | null; matchMode: 'equals' };
};

const logHistoryDataTableFilters: LogHistoryDataTableFiltersType = {
	request_id: { value: null, matchMode: 'contains' },
	entity: { value: null, matchMode: 'equals' },
	entity_id: { value: null, matchMode: 'equals' },
	action: { value: null, matchMode: 'equals' },
	source: { value: null, matchMode: 'equals' },
	recorded_at_start: { value: null, matchMode: 'equals' },
	recorded_at_end: { value: null, matchMode: 'equals' },
};

export const dataSourceConfigLogHistory = {
	dataTableState: {
		reloadTrigger: 0,
		first: 0,
		rows: 10,
		sortField: 'id',
		sortOrder: -1 as const,
		filters: logHistoryDataTableFilters,
	},
	dataTableColumns: [
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
					action: {
						name: 'view',
						source: 'log-history',
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
					action: entry.auth_id
						? {
								name: 'viewUser',
								source: 'log-history',
							}
						: undefined,
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
	functions: {
		find: findLogHistory,
		displayActionEntries: (entries: LogHistoryModel[]) => {
			return entries.map((entry) => ({
				id: entry.id,
				label: `${entry.entity}-${entry.entity_id}`,
			}));
		},
	},
	actions: {
		delete: {
			mode: 'action' as const,
			permission: 'log-history.delete',
			allowedEntries: 'multiple' as const,
			position: 'left' as const,
			function: deleteLogHistory,
			buttonProps: {
				variant: 'outline' as const,
				hover: 'error' as const,
			},
		},
		view: {
			mode: 'view' as const,
			component: ViewLogHistory,
			modalProps: {
				size: 'x2l' as const,
			},
			permission: 'log-history.read',
			allowedEntries: 'single' as const,
			position: 'hidden' as const,
		},
		viewUser: {
			component: ViewUser,
			modalProps: {
				size: 'x2l' as const,
			},
			customEntrySelected: async (entry: LogHistoryModel) => {
				if (entry.auth_id) {
					return (await getUser(entry.auth_id)) || null;
				}

				return null;
			},
			mode: 'view' as const,
			permission: 'user.read',
			allowedEntries: 'single' as const,
			position: 'hidden' as const,
		},
	},
};
