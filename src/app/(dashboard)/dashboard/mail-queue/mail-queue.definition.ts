import {
	type DataTableColumnType,
	DataTableValue,
} from '@/app/(dashboard)/_components/data-table-value';
import { ViewMailQueue } from '@/app/(dashboard)/dashboard/mail-queue/view-mail-queue.component';
import { ViewTemplate } from '@/app/(dashboard)/dashboard/templates/view-template.component';
import { formatDate } from '@/helpers/date.helper';
import type {
	MailQueueModel,
	MailQueueStatusEnum,
} from '@/models/mail-queue.model';
import { deleteMailQueue, findMailQueue } from '@/services/mail-queue.service';
import { getTemplate } from '@/services/templates.service';

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
		first: 0,
		rows: 10,
		sortField: 'id',
		sortOrder: -1 as const,
		filters: mailQueueDataTableFilters,
	},
	dataTableColumns: [
		{
			field: 'id',
			header: 'ID',
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
			header: 'Template',
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
			header: 'To',
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
			header: 'Status',
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
			header: 'Sent At',
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
			windowType: 'action' as const,
			permission: 'mail-queue.delete',
			entriesSelection: 'multiple' as const,
			buttonPosition: 'left' as const,
			operationFunction: deleteMailQueue,
			button: {
				variant: 'outline' as const,
				hover: 'error' as const,
			},
		},
		view: {
			windowType: 'view' as const,
			component: ViewMailQueue,
			modalProps: {
				size: 'x4l' as const,
			},
			permission: 'mail-queue.read',
			entriesSelection: 'single' as const,
			buttonPosition: 'hidden' as const,
		},
		viewTemplate: {
			windowType: 'view' as const,
			component: ViewTemplate,
			modalProps: {
				size: 'x4l' as const,
			},
			customEntrySelected: async (entry: MailQueueModel) => {
				if (entry.template) {
					return (await getTemplate(entry.template.id)) || null;
				}

				return null;
			},
			permission: 'template.read',
			entriesSelection: 'single' as const,
			buttonPosition: 'hidden' as const,
		},
	},
};
