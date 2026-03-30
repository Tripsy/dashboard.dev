'use client';

import type React from 'react';
import { useMemo } from 'react';
import type { BaseModelType } from '@/config/data-source.config';
import { useTranslation } from '@/hooks/use-translation.hook';

export function ViewEntry({
	actionEntry,
	children: ViewEntryComponent,
}: {
	actionEntry: BaseModelType | null;
	children: React.ComponentType<{ entry: BaseModelType }>;
}) {
	const translationsKeys = useMemo(
		() => ['dashboard.text.no_entry_selected'] as const,
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

	return <ViewEntryComponent entry={actionEntry} />;
}
