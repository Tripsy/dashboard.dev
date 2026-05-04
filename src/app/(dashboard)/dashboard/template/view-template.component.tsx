'use client';

import { formatDate } from '@/helpers/date.helper';
import { parseJson } from '@/helpers/string.helper';
import type { TemplateModel } from '@/models/template.model';

export function ViewTemplate({ entry }: { entry: TemplateModel }) {
	const parsedContent = parseJson(entry.content);

	return (
		<div className="space-y-6">
			<div className="space-y-1">
				<div>
					<span className="font-semibold">ID</span> {entry.id}
				</div>
				<div>
					<span className="font-semibold">Label</span> {entry.label}
				</div>
				<div>
					<span className="font-semibold">Language</span>{' '}
					{entry.language}
				</div>
				<div>
					<span className="font-semibold">Type</span> {entry.type}
				</div>
			</div>

			<div>
				<h3 className="font-bold border-b border-line pb-2 mb-3">
					Timestamps
				</h3>
				<div className="ml-4 space-y-1 text-sm">
					<div>
						<span className="font-semibold">Created At</span>{' '}
						{formatDate(entry.created_at, 'date-time')}
					</div>
					<div>
						<span className="font-semibold">Updated At</span>{' '}
						{formatDate(entry.updated_at, 'date-time')}
					</div>
					{entry.deleted_at && (
						<div>
							<span className="font-semibold">Deleted At</span>{' '}
							<span className="text-red-500">
								{formatDate(entry.deleted_at, 'date-time')}
							</span>
						</div>
					)}
				</div>
			</div>

			{parsedContent && (
				<div>
					<h3 className="font-bold border-b border-line pb-2 mb-3">
						Content
					</h3>
					<div className="ml-4 space-y-1">
						{Object.entries(parsedContent).map(([key, value]) => (
							<div key={key}>
								<span className="font-semibold capitalize">
									{key}
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
