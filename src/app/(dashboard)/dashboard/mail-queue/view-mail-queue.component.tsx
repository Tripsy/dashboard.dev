import { useMemo } from 'react';
import { useStore } from 'zustand/react';
import { DisplayStatus } from '@/app/(dashboard)/_components/data-table-value';
import { useDataTable } from '@/app/(dashboard)/_providers/data-table-provider';
import { formatDate } from '@/helpers/date.helper';
import { useTranslation } from '@/hooks/use-translation.hook';
import type { MailQueueModel } from '@/models/mail-queue.model';

export function ViewMailQueue() {
	const { dataTableStore } = useDataTable<'mail-queue', MailQueueModel>();
	const actionEntry = useStore(dataTableStore, (state) => state.actionEntry);

	const translationsKeys = useMemo(
		() =>
			[
				'dashboard.text.no_entry_selected',
				'mail-queue.view.section_details',
				'mail-queue.view.label_id',
				'mail-queue.view.label_template',
				'mail-queue.view.label_language',
				'mail-queue.view.label_created_at',
				'mail-queue.view.label_updated_at',
				'mail-queue.view.section_status',
				'mail-queue.view.label_status',
				'mail-queue.view.label_error',
				'mail-queue.view.label_sent_at',
				'mail-queue.view.label_to',
				'mail-queue.view.label_from',
				'mail-queue.view.section_content',
				'mail-queue.view.label_layout',
				'mail-queue.view.label_subject',
				'mail-queue.view.label_html',
				'mail-queue.view.label_vars',
			] as const,
		[],
	);

	const { translations } = useTranslation(translationsKeys);

	if (!actionEntry) {
		return (
			<div className="min-h-48 flex items-center justify-center">
				{translations['dashboard.text.no_entry_selected']}
			</div>
		);
	}

	const {
		id,
		template,
		language,
		content,
		to,
		from,
		status,
		error,
		sent_at,
		created_at,
		updated_at,
	} = actionEntry;

	return (
		<div className="space-y-6">
			<div>
				<h3 className="font-bold border-b border-line pb-2 mb-3">
					{translations['mail-queue.view.section_details']}
				</h3>
				<div className="ml-4 space-y-1">
					<div>
						<span className="font-semibold">
							{translations['mail-queue.view.label_id']}
						</span>{' '}
						{id}
					</div>
					<div>
						<span className="font-semibold">
							{translations['mail-queue.view.label_template']}
						</span>{' '}
						{template?.label || 'n/a'}
					</div>
					<div>
						<span className="font-semibold">
							{translations['mail-queue.view.label_language']}
						</span>{' '}
						{language}
					</div>
					<div>
						<span className="font-semibold">
							{translations['mail-queue.view.label_created_at']}
						</span>{' '}
						{formatDate(created_at, 'date-time')}
					</div>
					<div>
						<span className="font-semibold">
							{translations['mail-queue.view.label_updated_at']}
						</span>{' '}
						{formatDate(updated_at, 'date-time') || '-'}
					</div>
				</div>
			</div>

			<div>
				<h3 className="font-bold border-b border-line pb-2 mb-3">
					{translations['mail-queue.view.section_status']}
				</h3>
				<div className="ml-4 space-y-1">
					<div className="flex items-center gap-2">
						<span className="font-semibold">
							{translations['mail-queue.view.label_status']}
						</span>{' '}
						<div className="max-w-[240px]">
							<DisplayStatus status={status} />
						</div>
					</div>
					<div>
						<span className="font-semibold">
							{translations['mail-queue.view.label_error']}
						</span>{' '}
						{error || '-'}
					</div>
					<div>
						<span className="font-semibold">
							{translations['mail-queue.view.label_sent_at']}
						</span>{' '}
						{formatDate(sent_at, 'date-time') || '-'}
					</div>
					<div>
						<span className="font-semibold">
							{translations['mail-queue.view.label_to']}
						</span>{' '}
						{to.name} &lt;{to.address}&gt;
					</div>
					{from && (
						<div>
							<span className="font-semibold">
								{translations['mail-queue.view.label_from']}
							</span>{' '}
							{from?.name} &lt;{from?.address}&gt;
						</div>
					)}
				</div>
			</div>

			<div>
				<h3 className="font-bold border-b border-line pb-2 mb-3">
					{translations['mail-queue.view.section_content']}
				</h3>
				<div className="ml-4 space-y-1">
					<div>
						<span className="font-semibold">
							{translations['mail-queue.view.label_layout']}
						</span>{' '}
						{content.layout}
					</div>
					<div>
						<span className="font-semibold">
							{translations['mail-queue.view.label_subject']}
						</span>{' '}
						{content.subject}
					</div>
					<div>
						<span className="font-semibold">
							{translations['mail-queue.view.label_html']}
						</span>{' '}
						{content.html}
					</div>
					<div>
						<span className="font-semibold">
							{translations['mail-queue.view.label_vars']}
						</span>{' '}
						{/*TODO: security issues - sensitive information are displayed here*/}
						{JSON.stringify(content.vars, null, 2)}
					</div>
				</div>
			</div>
		</div>
	);
}
