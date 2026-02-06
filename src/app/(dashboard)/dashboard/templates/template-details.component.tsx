import { useMemo } from 'react';
import { formatDate } from '@/helpers/date.helper';
import { capitalizeFirstLetter, parseJson } from '@/helpers/string.helper';
import { useTranslation } from '@/hooks/use-translation.hook';
import type { TemplateModel } from '@/models/template.model';

export function TemplateDetails({
	entry,
}: {
	entry: TemplateModel | undefined;
}) {
	const translationsKeys = useMemo(
		() =>
			[
				'dashboard.text.no_entry_selected',
				'templates.view.section_details',
				'templates.view.label_id',
				'templates.view.label_label',
				'templates.view.label_language',
				'templates.view.label_type',
				'templates.view.section_timestamps',
				'templates.view.label_created_at',
				'templates.view.label_updated_at',
				'templates.view.label_deleted_at',
				'templates.view.section_content',
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

	const {
		id,
		label,
		language,
		type,
		content,
		created_at,
		updated_at,
		deleted_at,
	} = entry;

	const parsedContent = parseJson(content);

	return (
		<div className="space-y-6">
			<div>
				<h3 className="font-bold border-b border-line pb-2 mb-3">
					{translations['templates.view.section_details']}
				</h3>
				<div className="ml-4 space-y-1 text-sm">
					<div>
						<span className="font-semibold">
							{translations['templates.view.label_id']}
						</span>{' '}
						{id}
					</div>
					<div>
						<span className="font-semibold">
							{translations['templates.view.label_label']}
						</span>{' '}
						{label}
					</div>
					<div>
						<span className="font-semibold">
							{translations['templates.view.label_language']}
						</span>{' '}
						{language}
					</div>
					<div>
						<span className="font-semibold">
							{translations['templates.view.label_type']}
						</span>{' '}
						{capitalizeFirstLetter(type)}
					</div>
				</div>
			</div>

			<div>
				<h3 className="font-bold border-b border-line pb-2 mb-3">
					{translations['templates.view.section_timestamps']}
				</h3>
				<div className="ml-4 space-y-1 text-sm">
					<div>
						<span className="font-semibold">
							{translations['templates.view.label_created_at']}
						</span>{' '}
						{formatDate(created_at, 'date-time')}
					</div>
					<div>
						<span className="font-semibold">
							{translations['templates.view.label_updated_at']}
						</span>{' '}
						{formatDate(updated_at, 'date-time')}
					</div>
					{deleted_at && (
						<div>
							<span className="font-semibold">
								{
									translations[
										'templates.view.label_deleted_at'
									]
								}
							</span>{' '}
							<span className="text-red-500">
								{formatDate(deleted_at, 'date-time')}
							</span>
						</div>
					)}
				</div>
			</div>

			{parsedContent && (
				<div>
					<h3 className="font-bold border-b border-line pb-2 mb-3">
						{translations['templates.view.section_content']}
					</h3>
					<div className="ml-4 space-y-1">
						{Object.entries(parsedContent).map(([key, value]) => (
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
