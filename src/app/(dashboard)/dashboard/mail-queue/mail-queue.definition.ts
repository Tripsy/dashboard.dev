import { DataTableValue } from '@/app/(dashboard)/_components/data-table-value';
import { ViewMailQueue } from '@/app/(dashboard)/dashboard/mail-queue/view-mail-queue.component';
import type {
	DataSourceConfigType,
	DataTableColumnType,
	DataTableValueOptionsType,
} from '@/config/data-source.config';
import { translateBatch } from '@/config/translate.setup';
import { formatDate } from '@/helpers/date.helper';
import { requestDeleteMultiple, requestFind } from '@/helpers/services.helper';
import type {
	MailQueueModel,
	MailQueueStatus,
} from '@/models/mail-queue.model';
import type { FindFunctionParamsType } from '@/types/action.type';

const translations = await translateBatch(
	['delete.title', 'view.title', 'viewTemplate.label'] as const,
	'mail-queue.action',
);

export type MailQueueDataTableFiltersType = {
	status: { value: MailQueueStatus | null; matchMode: 'equals' };
	template: { value: string | null; matchMode: 'contains' };
	content: { value: string | null; matchMode: 'contains' };
	to: { value: string | null; matchMode: 'contains' };
	sent_at_start: { value: string | null; matchMode: 'equals' };
	sent_at_end: { value: string | null; matchMode: 'equals' };
};

function displayButtonViewTemplate(
	entry: MailQueueModel,
): DataTableValueOptionsType<MailQueueModel>['displayButton'] {
	if (!entry.template) {
		return undefined;
	}

	return {
		action: 'view',
		dataSource: 'template',
		altTitle: translations['viewTemplate.label'],
		alternateEntryId: entry.template.id,
	};
}

export const dataSourceConfigMailQueue: DataSourceConfigType<MailQueueModel> = {
	dataTable: {
		state: {
			first: 0,
			rows: 10,
			sortField: 'id',
			sortOrder: -1 as const,
			filters: {
				status: { value: null, matchMode: 'equals' },
				template: { value: null, matchMode: 'contains' },
				content: { value: null, matchMode: 'contains' },
				to: { value: null, matchMode: 'contains' },
				sent_at_start: { value: null, matchMode: 'equals' },
				sent_at_end: { value: null, matchMode: 'equals' },
			} satisfies MailQueueDataTableFiltersType,
		},
		columns: [
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
						displayButton: {
							action: 'view',
							dataSource: 'mail-queue',
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
						displayButton: displayButtonViewTemplate(entry),
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
		find: (params: FindFunctionParamsType) =>
			requestFind<MailQueueModel>('mail-queue', params),
	},
	displayEntryLabel: (entry: MailQueueModel) => {
		return formatDate(entry.sent_at) || '';
	},
	actions: {
		delete: {
			windowType: 'action',
			windowTitle: translations['delete.title'],
			permission: 'mail-queue.delete',
			entriesSelection: 'multiple',
			operationFunction: (ids: number[]) =>
				requestDeleteMultiple('mail-queue', ids),
			buttonPosition: 'left',
			button: {
				variant: 'outline',
				hover: 'error',
			},
		},
		view: {
			windowType: 'view',
			windowTitle: translations['view.title'],
			windowComponent: ViewMailQueue,
			windowConfigProps: {
				size: 'x4l',
			},
			permission: 'mail-queue.read',
			entriesSelection: 'single',
			buttonPosition: 'hidden',
		},
	},
};
