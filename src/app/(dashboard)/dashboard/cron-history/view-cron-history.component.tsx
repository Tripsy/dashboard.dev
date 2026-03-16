import { useMemo } from 'react';
import { useStore } from 'zustand/react';
import { DisplayStatus } from '@/app/(dashboard)/_components/data-table-value';
import { useDataTable } from '@/app/(dashboard)/_providers/data-table-provider';
import { formatDate } from '@/helpers/date.helper';
import { parseJson } from '@/helpers/string.helper';
import { useTranslation } from '@/hooks/use-translation.hook';
import type { CronHistoryModel } from '@/models/cron-history.model';

export function ViewCronHistory() {
	const { dataTableStore } = useDataTable<'cron-history', CronHistoryModel>();
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

	const parsedContent = parseJson(entry.content);

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
						Label
					</span>{' '}
					{entry.label}
				</div>
				<div>
					<span className="font-semibold">
						Start At
					</span>{' '}
					{formatDate(entry.start_at, 'date-time')}
				</div>
				<div>
					<span className="font-semibold">
						End At
					</span>{' '}
					{formatDate(entry.end_at, 'date-time') || 'n/a'}
				</div>
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
						Run Time
					</span>{' '}
					{entry.run_time} second(s)
				</div>
			</div>

			{parsedContent && (
				<div>
					<h3 className="font-bold border-b border-line pb-2 mb-3">
						Content
					</h3>
					<div className="ml-4 space-y-1">
						{Object.entries(parsedContent).map(([key, value]) => (
							<p key={key}>
								<span className="font-semibold capitalize">
									{key}
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
