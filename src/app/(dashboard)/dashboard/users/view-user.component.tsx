'use client';

import { useMemo } from 'react';
import { useStore } from 'zustand/react';
import { useDataTable } from '@/app/(dashboard)/_providers/data-table-provider';
import { UserDetails } from '@/app/(dashboard)/dashboard/users/user-details.component';
import { useTranslation } from '@/hooks';

export function ViewUser() {
	const { modelStore } = useDataTable<'users'>();
	const actionEntry = useStore(modelStore, (state) => state.actionEntry);

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

	return <UserDetails entry={actionEntry} />;
}
