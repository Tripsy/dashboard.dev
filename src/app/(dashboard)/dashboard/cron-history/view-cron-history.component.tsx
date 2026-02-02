import { useMemo } from 'react';
import { useStore } from 'zustand/react';
import { DisplayStatus } from '@/app/(dashboard)/_components/data-table-value';
import { useDataTable } from '@/app/(dashboard)/_providers/data-table-provider';
import { formatDate } from '@/helpers/date.helper';
import { parseJson } from '@/helpers/string.helper';
import { useTranslation } from '@/hooks';

export function ViewCronHistory() {
	const { modelStore } = useDataTable<'cron_history'>();
	const actionEntry = useStore(modelStore, (state) => state.actionEntry);

	const translationsKeys = useMemo(
		() =>
			[
				'dashboard.text.no_entry_selected',
				'cron_history.view.section_details',
				'cron_history.view.label_id',
				'cron_history.view.label_label',
				'cron_history.view.label_start_at',
				'cron_history.view.label_end_at',
				'cron_history.view.label_status',
				'cron_history.view.label_run_time',
				'cron_history.view.section_content',
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

	const { id, label, start_at, end_at, status, run_time, content } =
		actionEntry;

	const parsedContent = parseJson(content);

	return (
		<div className="space-y-6">
			<div>
				<h3 className="font-bold border-b border-line pb-2 mb-3">
					{translations['cron_history.view.section_details']}
				</h3>
				<div className="ml-4 space-y-1">
					<div>
						<span className="font-semibold">
							{translations['cron_history.view.label_id']}
						</span>{' '}
						{id}
					</div>
					<div>
						<span className="font-semibold">
							{translations['cron_history.view.label_label']}
						</span>{' '}
						{label}
					</div>
					<div>
						<span className="font-semibold">
							{translations['cron_history.view.label_start_at']}
						</span>{' '}
						{formatDate(start_at, 'date-time')}
					</div>
					<div>
						<span className="font-semibold">
							{translations['cron_history.view.label_end_at']}
						</span>{' '}
						{formatDate(end_at, 'date-time') || 'n/a'}
					</div>
					<div className="flex items-center gap-2">
						<span className="font-semibold">
							{translations['cron_history.view.label_status']}
						</span>{' '}
						<div className="max-w-[240px]">
							<DisplayStatus status={status} />
						</div>
					</div>
					<div>
						<span className="font-semibold">
							{translations['cron_history.view.label_run_time']}
						</span>{' '}
						{run_time} second(s)
					</div>
				</div>
			</div>

			{parsedContent && (
				<div>
					<h3 className="font-bold border-b border-line pb-2 mb-3">
						{translations['cron_history.view.section_content']}
					</h3>
					<div className="ml-4 space-y-1">
						{Object.entries(parsedContent).map(([key, value]) => (
							<p key={key}>
								<span className="font-semibold capitalize">
									{key}:
								</span>{' '}
								{typeof value === 'object'
									? JSON.stringify(value, null, 2)
									: String(value)}
							</p>
						))}
					</div>
				</div>
			)}
		</div>
	);
}
