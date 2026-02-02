import { useEffect, useMemo, useState } from 'react';
import { useStore } from 'zustand/react';
import { useDataTable } from '@/app/(dashboard)/_providers/data-table-provider';
import { UserDetails } from '@/app/(dashboard)/dashboard/users/user-details.component';
import { Loading } from '@/components/loading.component';
import type { UserModel } from '@/entities/user.model';
import { useTranslation } from '@/hooks';
import { useToast } from '@/providers/toast.provider';
import { getUser } from '@/services/users.service';

export function ViewLogHistoryUser() {
	const { showToast } = useToast();

	const { modelStore } = useDataTable<'log_history'>();
	const actionEntry = useStore(modelStore, (state) => state.actionEntry);

	const translationsKeys = useMemo(
		() =>
			[
				'app.text.loading',
				'app.text.error_title',
				'dashboard.text.no_entry_selected',
			] as const,
		[],
	);

	const { translations } = useTranslation(translationsKeys);

	const [entry, setEntry] = useState<UserModel | undefined>(undefined);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (!actionEntry) {
			return;
		}

		(async () => {
			if (!actionEntry?.auth_id) {
				return;
			}

			try {
				const user = await getUser(actionEntry.auth_id);

				setEntry(user);
			} catch (error) {
				showToast({
					severity: 'error',
					summary: translations['app.text.error_title'],
					detail: (error as Error).message,
				});
			} finally {
				setLoading(false);
			}
		})();
	}, [actionEntry, showToast, translations]);

	if (!actionEntry) {
		return (
			<div className="min-h-48 flex items-center justify-center">
				{translations['dashboard.text.no_entry_selected']}
			</div>
		);
	}

	if (loading) {
		return (
			<Loading
				text={translations['app.text.loading']}
				className="min-h-64 flex items-center justify-center"
			/>
		);
	}

	return <UserDetails entry={entry} />;
}
