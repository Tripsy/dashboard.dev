import {
	type DataTableColumnType,
	DataTableValue,
} from '@/app/(dashboard)/_components/data-table-value';
import { translateBatch } from '@/config/translate.setup';
import { formatDate } from '@/helpers/date.helper';
import type {
	MailQueueModel,
	MailQueueStatusEnum,
} from '@/models/mail-queue.model';
import { deleteMailQueue, findMailQueue } from '@/services/mail-queue.service';

const translations = await translateBatch([
	'mail-queue.data_table.column_id',
	'mail-queue.data_table.column_template',
	'mail-queue.data_table.column_to',
	'mail-queue.data_table.column_status',
	'mail-queue.data_table.column_sent_at',
]);

export type MailQueueDataTableFiltersType = {
	status: { value: MailQueueStatusEnum | null; matchMode: 'equals' };
	template: { value: string | null; matchMode: 'contains' };
	content: { value: string | null; matchMode: 'contains' };
	to: { value: string | null; matchMode: 'contains' };
	sent_date_start: { value: string | null; matchMode: 'equals' };
	sent_date_end: { value: string | null; matchMode: 'equals' };
};

const mailQueueDataTableFilters: MailQueueDataTableFiltersType = {
	status: { value: null, matchMode: 'equals' },
	template: { value: null, matchMode: 'contains' },
	content: { value: null, matchMode: 'contains' },
	to: { value: null, matchMode: 'contains' },
	sent_date_start: { value: null, matchMode: 'equals' },
	sent_date_end: { value: null, matchMode: 'equals' },
};

export const dataSourceConfigMailQueue = {
	dataTableState: {
		reloadTrigger: 0,
		first: 0,
		rows: 10,
		sortField: 'id',
		sortOrder: -1 as const,
		filters: mailQueueDataTableFilters,
	},
	dataTableColumns: [
		{
			field: 'id',
			header: translations['mail-queue.data_table.column_id'],
			sortable: true,
			body: (
				entry: MailQueueModel,
				column: DataTableColumnType<MailQueueModel>,
			) =>
				DataTableValue(entry, column, {
					markDeleted: true,
					action: {
						name: 'view',
						source: 'mail-queue',
					},
				}),
		},
		{
			field: 'template',
			header: translations['mail-queue.data_table.column_template'],
			body: (
				entry: MailQueueModel,
				column: DataTableColumnType<MailQueueModel>,
			) =>
				DataTableValue(entry, column, {
					customValue: entry.template?.label || 'n/a',
					action: {
						name: 'viewTemplate',
						source: 'mail-queue',
					},
				}),
		},
		{
			field: 'to',
			header: translations['mail-queue.data_table.column_to'],
			body: (
				entry: MailQueueModel,
				column: DataTableColumnType<MailQueueModel>,
			) =>
				DataTableValue(entry, column, {
					customValue: entry.to.address,
				}),
		},
		{
			field: 'status',
			header: translations['mail-queue.data_table.column_status'],
			body: (
				entry: MailQueueModel,
				column: DataTableColumnType<MailQueueModel>,
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
			field: 'sent_at',
			header: translations['mail-queue.data_table.column_sent_at'],
			sortable: true,
			body: (
				entry: MailQueueModel,
				column: DataTableColumnType<MailQueueModel>,
			) =>
				DataTableValue(entry, column, {
					displayDate: true,
				}),
		},
	],
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
			permission: 'mail-queue.delete',
			allowedEntries: 'multiple' as const,
			position: 'left' as const,
			function: deleteMailQueue,
			buttonProps: {
				variant: 'outline' as const,
				hover: 'error' as const,
			},
		},
		view: {
			mode: 'other' as const,
			permission: 'mail-queue.read',
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
