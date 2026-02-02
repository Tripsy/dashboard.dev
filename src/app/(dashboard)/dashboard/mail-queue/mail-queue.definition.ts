import { DataTableValue } from '@/app/(dashboard)/_components/data-table-value';
import type { DataTableColumnType } from '@/config/data-source';
import { translateBatch } from '@/config/lang';
import type { MailQueueModel } from '@/entities/mail-queue.model';
import { formatDate } from '@/helpers/date.helper';
import { deleteMailQueue, findMailQueue } from '@/services/mail-queue.service';

const translations = await translateBatch([
	'mail_queue.data_table.column_id',
	'mail_queue.data_table.column_template',
	'mail_queue.data_table.column_to',
	'mail_queue.data_table.column_status',
	'mail_queue.data_table.column_sent_at',
]);

const DataTableColumnsMailQueue: DataTableColumnType<MailQueueModel>[] = [
	{
		field: 'id',
		header: translations['mail_queue.data_table.column_id'],
		sortable: true,
		body: (entry, column) =>
			DataTableValue<'mail_queue'>(entry, column, {
				markDeleted: true,
				action: {
					name: 'view',
					source: 'mail_queue',
				},
			}),
	},
	{
		field: 'template',
		header: translations['mail_queue.data_table.column_template'],
		body: (entry, column) =>
			DataTableValue<'mail_queue'>(entry, column, {
				customValue: entry.template?.label || 'n/a',
				action: {
					name: 'viewTemplate',
					source: 'mail_queue',
				},
			}),
	},
	{
		field: 'to',
		header: translations['mail_queue.data_table.column_to'],
		body: (entry, column) =>
			DataTableValue<'mail_queue'>(entry, column, {
				customValue: entry.to.address,
			}),
	},
	{
		field: 'status',
		header: translations['mail_queue.data_table.column_status'],
		body: (entry, column) =>
			DataTableValue<'mail_queue'>(entry, column, {
				isStatus: true,
			}),
		style: {
			minWidth: '6rem',
			maxWidth: '6rem',
		},
	},
	{
		field: 'sent_at',
		header: translations['mail_queue.data_table.column_sent_at'],
		sortable: true,
		body: (entry, column) =>
			DataTableValue<'mail_queue'>(entry, column, {
				displayDate: true,
			}),
	},
];

const DataTableMailQueueFilters = {
	status: { value: null, matchMode: 'equals' },
	template: { value: null, matchMode: 'contains' },
	content: { value: null, matchMode: 'contains' },
	to: { value: null, matchMode: 'contains' },
	sent_date_start: { value: null, matchMode: 'equals' },
	sent_date_end: { value: null, matchMode: 'equals' },
};

export type DataSourceMailQueueType = {
	tableFilter: typeof DataTableMailQueueFilters;
	model: MailQueueModel;
};

export const DataSourceConfigMailQueue = {
	dataTableState: {
		reloadTrigger: 0,
		first: 0,
		rows: 10,
		sortField: 'id',
		sortOrder: -1 as const,
		filters: DataTableMailQueueFilters,
	},
	dataTableColumns: DataTableColumnsMailQueue,
	functions: {
		find: findMailQueue,
		displayActionEntries: (entries: MailQueueModel[]) => {
			return entries.map((entry) => ({
				id: entry.id,
				label: formatDate(entry.sent_at) || '',
			}));
		},
	},
	actions: {
		delete: {
			mode: 'action' as const,
			permission: 'mail_queue.delete',
			allowedEntries: 'multiple' as const,
			position: 'left' as const,
			function: deleteMailQueue,
			button: {
				className: 'btn btn-action-delete',
			},
		},
		view: {
			mode: 'other' as const,
			permission: 'mail_queue.read',
			allowedEntries: 'single' as const,
			position: 'hidden' as const,
		},
		viewTemplate: {
			type: 'view' as const,
			mode: 'other' as const,
			permission: 'template.read',
			allowedEntries: 'single' as const,
			position: 'hidden' as const,
		},
	},
};
