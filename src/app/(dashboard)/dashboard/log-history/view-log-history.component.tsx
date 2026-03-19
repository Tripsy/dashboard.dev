import { useMemo } from 'react';
import { useStore } from 'zustand/react';
import { useDataTable } from '@/app/(dashboard)/_providers/data-table-provider';
import { formatDate } from '@/helpers/date.helper';
import { parseJson } from '@/helpers/string.helper';
import { useTranslation } from '@/hooks/use-translation.hook';
import type { LogHistoryModel } from '@/models/log-history.model';

export function ViewLogHistory() {
	const { dataTableStore } = useDataTable<'log-history', LogHistoryModel>();
	const entry = useStore(dataTableStore, (state) => state.actionEntry);

	const translationsKeys = useMemo(
		() => ['dashboard.text.no_entry_selected'] as const,
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

	const parsedDetails = parseJson(entry.details);

	return (
		<div className="space-y-6">
			<div className="space-y-1">
				<div>
					<span className="font-semibold">ID</span> {entry.id}
				</div>
				<div>
					<span className="font-semibold">Request ID</span>{' '}
					{entry.request_id}
				</div>
				<div>
					<span className="font-semibold">Entity Type</span>{' '}
					{entry.entity}
				</div>
				<div>
					<span className="font-semibold">Entity ID</span>{' '}
					{entry.entity_id}
				</div>
				<div>
					<span className="font-semibold">Action</span> {entry.action}
				</div>
				<div>
					<span className="font-semibold">Auth ID</span>{' '}
					{entry.auth_id}
				</div>
				<div>
					<span className="font-semibold">Performed By</span>{' '}
					{entry.performed_by}
				</div>
				<div>
					<span className="font-semibold">Source</span> {entry.source}
				</div>
				<div>
					<span className="font-semibold">Recorded At</span>{' '}
					{formatDate(entry.recorded_at, 'date-time')}
				</div>
			</div>

			{parsedDetails?.request && (
				<div>
					<h3 className="font-bold border-b border-line pb-2 mb-3">
						Request Details
					</h3>
					<div className="ml-4 space-y-1">
						{Object.entries(parsedDetails).map(([key, value]) => (
							<div key={key}>
								<span className="font-semibold capitalize">
									{key}:
								</span>{' '}
								<span>
									{typeof value === 'object'
										? JSON.stringify(value, null, 2)
										: String(value)}
								</span>
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
}
