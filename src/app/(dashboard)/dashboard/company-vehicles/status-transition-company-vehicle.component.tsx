'use client';

import { useCallback, useMemo } from 'react';
import { dispatchFilterReset } from '@/app/(dashboard)/_events/data-table-filter-reset.event';
import {
	ErrorComponent,
	LoadingComponent,
} from '@/components/status.component';
import { DisplayStatus } from '@/helpers/display.helper';
import { getStatusTransitions } from '@/helpers/model.helper';
import { requestUpdateStatus } from '@/helpers/services.helper';
import { useTranslation } from '@/hooks/use-translation.hook';
import {
	type CompanyVehicleModel,
	type CompanyVehicleStatus,
	STATUS_TRANSITIONS,
} from '@/models/company-vehicle.model';
import { useToast } from '@/providers/toast.provider';
import { useModalStore } from '@/stores/window.store';
import type { WindowEntryType } from '@/types/window.type';

export function StatusTransitionCompanyVehicle({
	entries,
}: {
	entries: WindowEntryType[];
}) {
	const { close } = useModalStore();

	const { showToast } = useToast();

	const translationsKeys = useMemo(
		() =>
			[
				'app.text.error_title',
				'app.text.success_title',
				'app.error.entry_required',
				'company-vehicles.error.cannot_update_status',
				'company-vehicles.action.statusTransition.success',
			] as const,
		[],
	);

	const { isTranslationLoading, translations } =
		useTranslation(translationsKeys);

	const entry = entries[0] as CompanyVehicleModel | undefined;

	const statusTransitions = useMemo(
		() =>
			entry ? getStatusTransitions(entry.status, STATUS_TRANSITIONS) : [],
		[entry],
	);

	const handleStatusUpdate = useCallback(
		async (entry: CompanyVehicleModel, status: CompanyVehicleStatus) => {
			try {
				await requestUpdateStatus('company-vehicles', entry, status);

				showToast({
					severity: 'success',
					summary: translations['app.text.success_title'],
					detail: translations[
						'company-vehicles.action.statusTransition.success'
					],
				});

				dispatchFilterReset('company-vehicles');
			} catch (error) {
				showToast({
					severity: 'error',
					summary: translations['app.text.error_title'],
					detail: (error as Error).message,
				});
			} finally {
				close();
			}
		},
		[showToast, translations, close],
	);

	if (!entry) {
		return <ErrorComponent />;
	}

	if (isTranslationLoading) {
		return <LoadingComponent />;
	}

	if (!statusTransitions.length) {
		return (
			<ErrorComponent
				description={
					translations['company-vehicles.error.cannot_update_status']
				}
			/>
		);
	}

	return (
		<div>
			<p className="pb-4 font-semibold">
				Change company vehicle status to:
			</p>
			<div className="flex flex-wrap gap-4 items-center">
				{statusTransitions.map((status) => {
					return (
						<button
							key={status}
							type="button"
							className="cursor-pointer"
							aria-label={`Set status to ${status}`}
							onClick={() => handleStatusUpdate(entry, status)}
						>
							<DisplayStatus status={status} />
						</button>
					);
				})}
			</div>
		</div>
	);
}
