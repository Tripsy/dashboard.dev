import { useMemo } from 'react';
import { useStore } from 'zustand/react';
import { useDataTable } from '@/app/(dashboard)/_providers/data-table-provider';
import { formatDate } from '@/helpers/date.helper';
import { parseJson } from '@/helpers/string.helper';
import { useTranslation } from '@/hooks';

export function ViewLogData() {
	const { modelStore } = useDataTable<'log_data'>();
	const actionEntry = useStore(modelStore, (state) => state.actionEntry);

	const translationsKeys = useMemo(
		() =>
			[
				'dashboard.text.no_entry_selected',
				'log_data.view.section_details',
				'log_data.view.label_id',
				'log_data.view.label_pid',
				'log_data.view.label_request_id',
				'log_data.view.label_category',
				'log_data.view.label_level',
				'log_data.view.label_message',
				'log_data.view.label_created_at',
				'log_data.view.section_context',
				'log_data.view.label_method',
				'log_data.view.label_url',
				'log_data.view.label_body',
				'log_data.view.label_params',
				'log_data.view.label_query',
				'log_data.view.section_debug_stack',
				'log_data.view.label_file',
				'log_data.view.label_line',
				'log_data.view.label_function',
				'log_data.view.label_trace',
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
					{translations['log_data.view.section_details']}
				</h3>
				<div className="ml-4 space-y-1">
					<div>
						<span className="font-semibold">
							{translations['log_data.view.label_id']}
						</span>{' '}
						{id}
					</div>
					<div>
						<span className="font-semibold">
							{translations['log_data.view.label_pid']}
						</span>{' '}
						{pid}
					</div>
					<div>
						<span className="font-semibold">
							{translations['log_data.view.label_request_id']}
						</span>{' '}
						{request_id}
					</div>
					<div>
						<span className="font-semibold">
							{translations['log_data.view.label_category']}
						</span>{' '}
						{category}
					</div>
					<div>
						<span className="font-semibold">
							{translations['log_data.view.label_level']}
						</span>{' '}
						{level}
					</div>
					<div>
						<span className="font-semibold">
							{translations['log_data.view.label_message']}
						</span>{' '}
						{message}
					</div>
					<div>
						<span className="font-semibold">
							{translations['log_data.view.label_created_at']}
						</span>{' '}
						{formatDate(created_at, 'date-time')}
					</div>
				</div>
			</div>

			{parsedContext?.request && (
				<div>
					<h3 className="font-bold border-b border-line pb-2 mb-3">
						{translations['log_data.view.section_context']}
					</h3>
					<div className="ml-4 space-y-1">
						<div>
							<span className="font-semibold">
								{translations['log_data.view.label_method']}
							</span>{' '}
							{parsedContext.request.method}
						</div>
						<div>
							<span className="font-semibold">
								{translations['log_data.view.label_url']}
							</span>{' '}
							{decodeURI(parsedContext.request.url)}
						</div>
						<div>
							<span className="font-semibold">
								{translations['log_data.view.label_body']}
							</span>{' '}
							{JSON.stringify(parsedContext.request.body)}
						</div>
						<div>
							<span className="font-semibold">
								{translations['log_data.view.label_params']}
							</span>{' '}
							{JSON.stringify(parsedContext.request.params)}
						</div>
						<div>
							<span className="font-semibold">
								{translations['log_data.view.label_query']}
							</span>{' '}
							{JSON.stringify(parsedContext.request.query)}
						</div>
					</div>
				</div>
			)}

			{parsedDebugStack && (
				<div>
					<h3 className="font-bold border-b border-line pb-2 mb-3">
						{translations['log_data.view.section_debug_stack']}
					</h3>
					<div className="ml-4 space-y-1">
						<div>
							<span className="font-semibold">
								{translations['log_data.view.label_file']}
							</span>{' '}
							{parsedDebugStack.file}
						</div>
						<div>
							<span className="font-semibold">
								{translations['log_data.view.label_line']}
							</span>{' '}
							{parsedDebugStack.line}
						</div>
						<div>
							<span className="font-semibold">
								{translations['log_data.view.label_function']}
							</span>{' '}
							{parsedDebugStack.function}
						</div>
						{parsedDebugStack.trace && (
							<div>
								<span className="font-semibold">
									{translations['log_data.view.label_trace']}
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
