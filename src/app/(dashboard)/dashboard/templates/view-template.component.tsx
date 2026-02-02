'use client';

import { useMemo } from 'react';
import { useStore } from 'zustand/react';
import { useDataTable } from '@/app/(dashboard)/_providers/data-table-provider';
import { TemplateDetails } from '@/app/(dashboard)/dashboard/templates/template-details.component';
import { useTranslation } from '@/hooks';

export function ViewTemplate() {
	const { dataTableStore } = useDataTable<'templates'>();
	const actionEntry = useStore(dataTableStore, (state) => state.actionEntry);

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

	return <TemplateDetails entry={actionEntry} />;
}
