import { useMemo } from 'react';
import { useStore } from 'zustand/react';
import { useDataTable } from '@/app/(dashboard)/_providers/data-table-provider';
import { formatDate } from '@/helpers/date.helper';
import { parseJson } from '@/helpers/string.helper';
import { useTranslation } from '@/hooks/use-translation.hook';
import type { LogDataModel } from '@/models/log-data.model';

export function ViewLogData() {
	const { dataTableStore } = useDataTable<'log-data', LogDataModel>();
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

	const parsedContext = parseJson(entry.context);
	const parsedDebugStack = parseJson(entry.debugStack);

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
						PID
					</span>{' '}
					{entry.pid}
				</div>
				<div>
					<span className="font-semibold">
						Request ID
					</span>{' '}
					{entry.request_id ?? 'n/a'}
				</div>
				<div>
					<span className="font-semibold">
						Category
					</span>{' '}
					{entry.category}
				</div>
				<div>
					<span className="font-semibold">
						Level
					</span>{' '}
					{entry.level}
				</div>
				<div>
					<span className="font-semibold">
						Message
					</span>{' '}
					{entry.message}
				</div>
				<div>
					<span className="font-semibold">
						Created At
					</span>{' '}
					{formatDate(entry.created_at, 'date-time')}
				</div>
			</div>

			{parsedContext?.request && (
				<div>
					<h3 className="font-bold border-b border-line pb-2 mb-3">
						Request Context
					</h3>
					<div className="ml-4 space-y-1">
						<div>
							<span className="font-semibold">
								Method
							</span>{' '}
							{parsedContext.request.method}
						</div>
						<div>
							<span className="font-semibold">
								URL
							</span>{' '}
							{decodeURI(parsedContext.request.url)}
						</div>
						<div>
							<span className="font-semibold">
								Body
							</span>{' '}
							{JSON.stringify(parsedContext.request.body)}
						</div>
						<div>
							<span className="font-semibold">
								Params
							</span>{' '}
							{JSON.stringify(parsedContext.request.params)}
						</div>
						<div>
							<span className="font-semibold">
								Query
							</span>{' '}
							{JSON.stringify(parsedContext.request.query)}
						</div>
					</div>
				</div>
			)}

			{parsedDebugStack && (
				<div>
					<h3 className="font-bold border-b border-line pb-2 mb-3">
						Debug Stack
					</h3>
					<div className="ml-4 space-y-1">
						<div>
							<span className="font-semibold">
								File
							</span>{' '}
							{parsedDebugStack.file}
						</div>
						<div>
							<span className="font-semibold">
								Line
							</span>{' '}
							{parsedDebugStack.line}
						</div>
						<div>
							<span className="font-semibold">
								Function
							</span>{' '}
							{parsedDebugStack.function}
						</div>
						{parsedDebugStack.trace && (
							<div>
								<span className="font-semibold">
									Trace
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
