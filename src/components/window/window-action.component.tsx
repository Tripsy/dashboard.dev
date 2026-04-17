'use client';

import { useMemo, useState } from 'react';
import { dispatchFilterReset } from '@/app/(dashboard)/_events/data-table-filter-reset.event';
import { ActionButton } from '@/components/action-button.component';
import { Icons } from '@/components/icon.component';
import { LoadingComponent } from '@/components/status.component';
import { Button } from '@/components/ui/button';
import type { DataSourceKey } from '@/config/data-source.config';
import { ApiError } from '@/exceptions/api.error';
import ValueError from '@/exceptions/value.error';
import { replaceVars } from '@/helpers/string.helper';
import { useTranslation } from '@/hooks/use-translation.hook';
import { useToast } from '@/providers/toast.provider';
import { useModalStore } from '@/stores/window.store';
import type {
	ActionOperationMultipleFunctionType,
	ActionOperationSingleFunctionType,
} from '@/types/action.type';
import type { FormValuesType } from '@/types/form.type';
import type { WindowConfig, WindowEntryType } from '@/types/window.type';

export function WindowAction<WindowEntry extends WindowEntryType>({
	uid,
	entries,
}: {
	uid: string;
	entries: WindowEntry[];
}) {
	const [loading, setLoading] = useState(false);
	const { showToast } = useToast();

	const { getWindow, close } = useModalStore();

	const windowConfig = getWindow(uid) as
		| WindowConfig<FormValuesType, WindowEntry>
		| undefined;
	const windowDefinition = windowConfig?.definition;

	// Guards
	if (!windowConfig) {
		throw new Error(`Window config not found for uid: ${uid}`);
	}

	if (!windowDefinition) {
		throw new Error(`Window definition not found for uid: ${uid}`);
	}

	if (windowDefinition.entriesSelection === 'single' && entries.length > 1) {
		throw new ValueError(`Multiple entries provided for single action`);
	}

	// WindowAction only handles action operations.
	const operationFunction = windowDefinition.operationFunction;

	// + Guards
	if (!operationFunction || typeof operationFunction !== 'function') {
		throw new ValueError(
			`Operation function is not defined for uid: ${uid}`,
		);
	}

	const displayEntryLabel = windowDefinition.displayEntryLabel;

	if (!displayEntryLabel || typeof displayEntryLabel !== 'function') {
		throw new ValueError(
			`"displayEntryLabel" function is not defined for uid: ${uid}`,
		);
	}

	const windowEvents = windowConfig.events;

	const confirmTextKey = `${windowConfig.dataSource}.action.${windowConfig.action}.confirmText`;

	const translationsKeys = useMemo(
		() =>
			[
				confirmTextKey,
				'app.error.generic',
				'app.text.success_title',
				'app.text.error_title',
				'dashboard.text.selected_entries_one',
				'dashboard.text.selected_entries_many',
			] as const,
		[confirmTextKey],
	);

	const { translations, isTranslationLoading } =
		useTranslation(translationsKeys);

	const handleClose = () => {
		close(uid);
	};

	const handleAction = async () => {
		setLoading(true);

		try {
			const fetchResponse =
				windowDefinition.entriesSelection === 'single'
					? await (
							operationFunction as ActionOperationSingleFunctionType<WindowEntry>
						)(entries[0])
					: await (
							operationFunction as ActionOperationMultipleFunctionType
						)(entries.map((e) => e.id as number));

			if (fetchResponse?.success) {
				showToast({
					severity: 'success',
					summary: translations['app.text.success_title'],
					detail: fetchResponse?.message,
				});

				if (windowConfig.section === 'dashboard') {
					dispatchFilterReset(
						windowConfig.dataSource as DataSourceKey,
					);
				}

				windowEvents?.success?.();

				handleClose();
			} else {
				showToast({
					severity: 'error',
					summary: translations['app.text.error_title'],
					detail: fetchResponse?.message,
				});

				windowEvents?.error?.();
			}
		} catch (error) {
			showToast({
				severity: 'error',
				summary: 'Error',
				detail:
					error instanceof ValueError || error instanceof ApiError
						? error.message
						: translations['app.error.generic'],
			});
		} finally {
			setLoading(false);
		}
	};

	if (isTranslationLoading) {
		return <LoadingComponent />;
	}

	return (
		<>
			<p className="pb-4 font-semibold">
				{replaceVars(
					entries.length === 1
						? translations['dashboard.text.selected_entries_one']
						: translations['dashboard.text.selected_entries_many'],
					{
						count: entries.length.toString(),
					},
				)}
			</p>
			<ul className="pb-4 italic list-disc ml-4">
				{entries.map((entry) => (
					<li key={`action-entry-${entry.id}`}>
						{displayEntryLabel(entry)}{' '}
						<span className="text-md">({`#${entry.id}`})</span>
					</li>
				))}
			</ul>
			<p className="pb-4 font-semibold">{translations[confirmTextKey]}</p>

			<div className="flex justify-end gap-3">
				<Button
					variant="outline"
					hover="warning"
					onClick={handleClose}
					title="Cancel"
					disabled={loading}
				>
					<Icons.Action.Cancel />
					Cancel
				</Button>
				<ActionButton
					dataSource={windowConfig.dataSource}
					action={windowConfig.action}
					buttonProps={windowDefinition.button}
					handleClick={handleAction}
					disabled={loading}
				/>
			</div>
		</>
	);
}
