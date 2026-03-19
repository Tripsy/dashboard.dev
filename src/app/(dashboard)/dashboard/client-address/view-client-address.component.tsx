'use client';

import { useMemo } from 'react';
import { useStore } from 'zustand/react';
import { useDataTable } from '@/app/(dashboard)/_providers/data-table-provider';
import { ClientAddressDetails } from '@/app/(dashboard)/dashboard/client-address/client-address-details.component';
import { useTranslation } from '@/hooks/use-translation.hook';
import type { ClientAddressModel } from '@/models/client-address.model';

export function ViewClientAddress() {
	const { dataTableStore } = useDataTable<
		'client-address',
		ClientAddressModel
	>();
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

	return <ClientAddressDetails entry={actionEntry} />;
}
