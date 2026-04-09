import { useCallback, useEffect, useMemo } from 'react';
import { dispatchFilterReset } from '@/app/(dashboard)/_events/data-table-filter-reset.event';
import type { DataSourceKey } from '@/config/data-source.config';
import { useTranslation } from '@/hooks/use-translation.hook';
import { useToast } from '@/providers/toast.provider';
import { useModalStore } from '@/stores/window.store';
import type {
	FormEventType,
	FormStateType,
	FormValuesType,
} from '@/types/form.type';
import type { WindowConfig, WindowEntryType } from '@/types/window.type';

type UseWindowFormProcessedParams<
	FormValues extends FormValuesType,
	Entry extends WindowEntryType,
> = {
	state: FormStateType<FormValues>;
	windowConfig: WindowConfig<FormValues, Entry>;
	eventsOnFormProcess?: Record<string, FormEventType<unknown>>;
};

export function useWindowFormProcessed<
	FormValues extends FormValuesType,
	Entry extends WindowEntryType,
>({
	state,
	windowConfig,
	eventsOnFormProcess,
}: UseWindowFormProcessedParams<FormValues, Entry>) {
	const { close } = useModalStore();
	const { showToast } = useToast();

	const actionLabelKey = `${windowConfig.key}.action.${windowConfig.action}.label`;
	const successMessageKey = `${windowConfig.key}.action.${windowConfig.action}.success`;

	const translationsKeys = useMemo(
		() =>
			[
				successMessageKey,
				actionLabelKey,
				'app.text.success_title',
			] as const,
		[actionLabelKey, successMessageKey],
	);

	const { translations } = useTranslation(translationsKeys);

	const handleFormProcessed = useCallback(
		async (situation: string, resultData?: unknown) => {
			if (situation === 'success') {
				showToast({
					severity: 'success',
					summary: translations['app.text.success_title'],
					detail: translations[successMessageKey],
				});

				if (windowConfig.section === 'dashboard') {
					dispatchFilterReset(windowConfig.key as DataSourceKey);
				}

				close(windowConfig.uid);
			}

			eventsOnFormProcess?.[situation]?.(resultData);
		},
		[
			eventsOnFormProcess,
			showToast,
			translations,
			successMessageKey,
			windowConfig,
			close,
		],
	);

	// biome-ignore lint/correctness/useExhaustiveDependencies: Fire on situation transitions, not when handleFormProcessed re-creates due to translation reloads or config changes.
	useEffect(() => {
		if (state.situation === 'success' || state.situation === 'error') {
			handleFormProcessed(state.situation, state.resultData).catch(
				console.error,
			);
		}
	}, [state.situation]);
}
