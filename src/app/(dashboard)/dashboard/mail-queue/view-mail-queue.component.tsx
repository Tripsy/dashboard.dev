import { useMemo } from 'react';
import { useStore } from 'zustand/react';
import { DisplayStatus } from '@/app/(dashboard)/_components/data-table-value';
import { useDataTable } from '@/app/(dashboard)/_providers/data-table-provider';
import { formatDate } from '@/helpers/date.helper';
import { useTranslation } from '@/hooks/use-translation.hook';
import type { MailQueueModel } from '@/models/mail-queue.model';

export function ViewMailQueue() {
	const { dataTableStore } = useDataTable<'mail-queue', MailQueueModel>();
	const entry = useStore(dataTableStore, (state) => state.actionEntry);

	const translationsKeys = useMemo(
		() =>
			[
				'dashboard.text.no_entry_selected',
			] as const,
		[],
	);

	const { translations } = useTranslation(translationsKeys);

	if (!entry) {
		return (
			<div className="min-h-48 flex items-center justify-center">
				{translations['dashboard.text.no_entry_selected']}
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="space-y-1">
				<div>
					<span className="font-semibold">
						ID
					</span>{' '}
					{entry.id}
				</div>
				<div>
					<span className="font-semibold">
						Created At
					</span>{' '}
					{formatDate(entry.created_at, 'date-time')}
				</div>
				<div>
					<span className="font-semibold">
						Updated At
					</span>{' '}
					{formatDate(entry.updated_at, 'date-time') || '-'}
				</div>
			</div>

			<div>
				<h3 className="font-bold border-b border-line pb-2 mb-3">
					State
				</h3>
				<div className="ml-4 space-y-1">
					<div className="flex items-center gap-2">
						<span className="font-semibold">
							Status
						</span>{' '}
						<div className="max-w-60">
							<DisplayStatus status={entry.status} />
						</div>
					</div>
					<div>
						<span className="font-semibold">
							Error
						</span>{' '}
						{entry.error || '-'}
					</div>
					<div>
						<span className="font-semibold">
							Sent At
						</span>{' '}
						{formatDate(entry.sent_at, 'date-time') || '-'}
					</div>
					<div>
						<span className="font-semibold">
							Email To
						</span>{' '}
						{entry.to.name} &lt;{entry.to.address}&gt;
					</div>
					{entry.from && (
						<div>
							<span className="font-semibold">
								Email From
							</span>{' '}
							{entry.from?.name} &lt;{entry.from?.address}&gt;
						</div>
					)}
				</div>
			</div>

			<div>
				<h3 className="font-bold border-b border-line pb-2 mb-3">
					Email Data
				</h3>
				<div className="ml-4 space-y-1">
					<div>
						<span className="font-semibold">
							Template
						</span>{' '}
						{entry.template?.label || 'n/a'}
					</div>
					<div>
						<span className="font-semibold">
							Language
						</span>{' '}
						{entry.language}
					</div>
					<div>
						<span className="font-semibold">
							Layout
						</span>{' '}
						{entry.content.layout}
					</div>
					<div>
						<span className="font-semibold">
							Subject
						</span>{' '}
						{entry.content.subject}
					</div>
					<div>
						<span className="font-semibold">
							Content
						</span>{' '}
						{entry.content.html}
					</div>
					<div>
						<span className="font-semibold">
							Vars
						</span>{' '}
						{JSON.stringify(entry.content.vars, null, 2)}
					</div>
				</div>
			</div>
		</div>
	);
}
