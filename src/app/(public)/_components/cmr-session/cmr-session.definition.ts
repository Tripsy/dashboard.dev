import type { DataSourceConfigType } from '@/config/data-source.config';
import { translateBatch } from '@/config/translate.setup';
import type { CmrSessionModel } from '@/models/cmr-session.model';
import { deleteCmrSession } from '@/services/cmr-session.service';

const translations = await translateBatch(
	['drop.title'] as const,
	'cmr-session.action',
);

export const dataSourceConfigCmrSession: DataSourceConfigType<CmrSessionModel> =
	{
		displayEntryLabel: (entry: CmrSessionModel) => {
			return `CMR${entry.cmr.id}`;
		},
		actions: {
			drop: {
				windowType: 'action',
				windowTitle: translations['drop.title'],
				permission: 'cmr-session.delete',
				entriesSelection: 'single',
				operationFunction: (entry: CmrSessionModel) =>
					deleteCmrSession(entry),
				buttonPosition: 'left',
				button: {
					variant: 'outline',
					hover: 'error',
				},
			},
		},
	};
