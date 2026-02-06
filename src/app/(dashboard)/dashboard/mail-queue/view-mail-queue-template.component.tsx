import { useEffect, useMemo, useState } from 'react';
import { useStore } from 'zustand/react';
import { useDataTable } from '@/app/(dashboard)/_providers/data-table-provider';
import { TemplateDetails } from '@/app/(dashboard)/dashboard/templates/template-details.component';
import { Loading } from '@/components/loading.component';
import { useTranslation } from '@/hooks/use-translation.hook';
import type { MailQueueModel } from '@/models/mail-queue.model';
import type { TemplateModel } from '@/models/template.model';
import { useToast } from '@/providers/toast.provider';
import { getTemplate } from '@/services/templates.service';

export function ViewMailQueueTemplate() {
	const { showToast } = useToast();

	const { dataTableStore } = useDataTable<'mail-queue', MailQueueModel>();
	const actionEntry = useStore(dataTableStore, (state) => state.actionEntry);

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

	const [entry, setEntry] = useState<TemplateModel | undefined>(undefined);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (!actionEntry) {
			return;
		}

		(async () => {
			if (!actionEntry?.template?.id) {
				return;
			}

			try {
				const template = await getTemplate(actionEntry.template.id);

				setEntry(template);
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

	return <TemplateDetails entry={entry} />;
}
