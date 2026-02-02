import { useMemo } from 'react';
import { useStore } from 'zustand/react';
import { useDataTable } from '@/app/(dashboard)/_providers/data-table-provider';
import { formatDate } from '@/helpers/date.helper';
import { parseJson } from '@/helpers/string.helper';
import { useTranslation } from '@/hooks';

export function ViewLogHistory() {
	const { modelStore } = useDataTable<'log_history'>();
	const actionEntry = useStore(modelStore, (state) => state.actionEntry);

	const translationsKeys = useMemo(
		() =>
			[
				'dashboard.text.no_entry_selected',
				'log_history.view.section_info',
				'log_history.view.section_details',
				'log_history.view.label_id',
				'log_history.view.label_entity',
				'log_history.view.label_entity_id',
				'log_history.view.label_action',
				'log_history.view.label_auth_id',
				'log_history.view.label_performed_by',
				'log_history.view.label_request_id',
				'log_history.view.label_source',
				'log_history.view.label_recorded_at',
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
		entity,
		entity_id,
		action,
		auth_id,
		performed_by,
		request_id,
		source,
		recorded_at,
		details,
	} = actionEntry;

	const parsedDetails = parseJson(details);

	return (
		<div className="space-y-6">
			<div>
				<h3 className="font-bold border-b border-line pb-2 mb-3">
					{translations['log_history.view.section_info']}
				</h3>
				<div className="ml-4 space-y-1">
					<div>
						<span className="font-semibold">
							{translations['log_history.view.label_id']}
						</span>{' '}
						{id}
					</div>
					<div>
						<span className="font-semibold">
							{translations['log_history.view.label_request_id']}
						</span>{' '}
						{request_id}
					</div>
					<div>
						<span className="font-semibold">
							{translations['log_history.view.label_entity']}
						</span>{' '}
						{entity}
					</div>
					<div>
						<span className="font-semibold">
							{translations['log_history.view.label_entity_id']}
						</span>{' '}
						{entity_id}
					</div>
					<div>
						<span className="font-semibold">
							{translations['log_history.view.label_action']}
						</span>{' '}
						{action}
					</div>
					<div>
						<span className="font-semibold">
							{translations['log_history.view.label_auth_id']}
						</span>{' '}
						{auth_id}
					</div>
					<div>
						<span className="font-semibold">
							{
								translations[
									'log_history.view.label_performed_by'
								]
							}
						</span>{' '}
						{performed_by}
					</div>
					<div>
						<span className="font-semibold">
							{translations['log_history.view.label_source']}
						</span>{' '}
						{source}
					</div>
					<div>
						<span className="font-semibold">
							{translations['log_history.view.label_recorded_at']}
						</span>{' '}
						{formatDate(recorded_at, 'date-time')}
					</div>
				</div>
			</div>

			{parsedDetails?.request && (
				<div>
					<h3 className="font-bold border-b border-line pb-2 mb-3">
						{translations['log_history.view.section_details']}
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
