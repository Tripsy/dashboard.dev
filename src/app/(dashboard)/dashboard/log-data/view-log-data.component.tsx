import { useMemo } from 'react';
import { useStore } from 'zustand/react';
import { useDataTable } from '@/app/(dashboard)/_providers/data-table-provider';
import { formatDate } from '@/helpers/date.helper';
import { parseJson } from '@/helpers/string.helper';
import { useTranslation } from '@/hooks/use-translation.hook';
import type { LogDataModel } from '@/models/log-data.model';

export function ViewLogData() {
	const { dataTableStore } = useDataTable<'log-data', LogDataModel>();
	const actionEntry = useStore(dataTableStore, (state) => state.actionEntry);

	const translationsKeys = useMemo(
		() =>
			[
				'dashboard.text.no_entry_selected',
				'log-data.view.section_details',
				'log-data.view.label_id',
				'log-data.view.label_pid',
				'log-data.view.label_request_id',
				'log-data.view.label_category',
				'log-data.view.label_level',
				'log-data.view.label_message',
				'log-data.view.label_created_at',
				'log-data.view.section_context',
				'log-data.view.label_method',
				'log-data.view.label_url',
				'log-data.view.label_body',
				'log-data.view.label_params',
				'log-data.view.label_query',
				'log-data.view.section_debug_stack',
				'log-data.view.label_file',
				'log-data.view.label_line',
				'log-data.view.label_function',
				'log-data.view.label_trace',
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
		pid,
		request_id,
		category,
		level,
		message,
		context,
		debugStack,
		created_at,
	} = actionEntry;

	const parsedContext = parseJson(context);
	const parsedDebugStack = parseJson(debugStack);

	return (
		<div className="space-y-6">
			<div>
				<h3 className="font-bold border-b border-line pb-2 mb-3">
					{translations['log-data.view.section_details']}
				</h3>
				<div className="ml-4 space-y-1">
					<div>
						<span className="font-semibold">
							{translations['log-data.view.label_id']}
						</span>{' '}
						{id}
					</div>
					<div>
						<span className="font-semibold">
							{translations['log-data.view.label_pid']}
						</span>{' '}
						{pid}
					</div>
					<div>
						<span className="font-semibold">
							{translations['log-data.view.label_request_id']}
						</span>{' '}
						{request_id}
					</div>
					<div>
						<span className="font-semibold">
							{translations['log-data.view.label_category']}
						</span>{' '}
						{category}
					</div>
					<div>
						<span className="font-semibold">
							{translations['log-data.view.label_level']}
						</span>{' '}
						{level}
					</div>
					<div>
						<span className="font-semibold">
							{translations['log-data.view.label_message']}
						</span>{' '}
						{message}
					</div>
					<div>
						<span className="font-semibold">
							{translations['log-data.view.label_created_at']}
						</span>{' '}
						{formatDate(created_at, 'date-time')}
					</div>
				</div>
			</div>

			{parsedContext?.request && (
				<div>
					<h3 className="font-bold border-b border-line pb-2 mb-3">
						{translations['log-data.view.section_context']}
					</h3>
					<div className="ml-4 space-y-1">
						<div>
							<span className="font-semibold">
								{translations['log-data.view.label_method']}
							</span>{' '}
							{parsedContext.request.method}
						</div>
						<div>
							<span className="font-semibold">
								{translations['log-data.view.label_url']}
							</span>{' '}
							{decodeURI(parsedContext.request.url)}
						</div>
						<div>
							<span className="font-semibold">
								{translations['log-data.view.label_body']}
							</span>{' '}
							{JSON.stringify(parsedContext.request.body)}
						</div>
						<div>
							<span className="font-semibold">
								{translations['log-data.view.label_params']}
							</span>{' '}
							{JSON.stringify(parsedContext.request.params)}
						</div>
						<div>
							<span className="font-semibold">
								{translations['log-data.view.label_query']}
							</span>{' '}
							{JSON.stringify(parsedContext.request.query)}
						</div>
					</div>
				</div>
			)}

			{parsedDebugStack && (
				<div>
					<h3 className="font-bold border-b border-line pb-2 mb-3">
						{translations['log-data.view.section_debug_stack']}
					</h3>
					<div className="ml-4 space-y-1">
						<div>
							<span className="font-semibold">
								{translations['log-data.view.label_file']}
							</span>{' '}
							{parsedDebugStack.file}
						</div>
						<div>
							<span className="font-semibold">
								{translations['log-data.view.label_line']}
							</span>{' '}
							{parsedDebugStack.line}
						</div>
						<div>
							<span className="font-semibold">
								{translations['log-data.view.label_function']}
							</span>{' '}
							{parsedDebugStack.function}
						</div>
						{parsedDebugStack.trace && (
							<div>
								<span className="font-semibold">
									{translations['log-data.view.label_trace']}
								</span>
								<pre className="bg-gray-50 border rounded p-2 text-xs mt-1 overflow-x-auto">
									{parsedDebugStack.trace.join('\n')}
								</pre>
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	);
}
