'use client';

import { current } from 'immer';
import { useMemo, useState } from 'react';
import { ActionButton } from '@/components/action-button.component';
import { Icons } from '@/components/icon.component';
import { LoadingComponent } from '@/components/status.component';
import { Button } from '@/components/ui/button';
import { ApiError } from '@/exceptions/api.error';
import ValueError from '@/exceptions/value.error';
import { replaceVars } from '@/helpers/string.helper';
import { useToast } from '@/providers/toast.provider';
import { useModalStore } from '@/stores/window.store';
import type { ActionOperationFunctionType } from '@/types/action.type';
import type { FormValuesType } from '@/types/form.type';
import type { WindowConfig, WindowEntryType } from '@/types/window.type';

export function WindowAction<WindowEntry extends WindowEntryType>({
	uid,
	// actionName,
	entries,
	// onSuccessAction,
	// onCloseAction,
}: {
	uid: string;
	// actionName: string;
	entries: WindowEntry[];
	// onSuccessAction?: OnSuccessActionType;
	// onCloseAction: () => void;
}) {
	const [loading, setLoading] = useState(false);
	const { showToast } = useToast();

	const { getWindow } = useModalStore();

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

	// WindowAction only handles action operations.
	const operationFunction =
		windowDefinition.operationFunction as ActionOperationFunctionType;

	// + Guards
	if (!operationFunction || typeof operationFunction !== 'function') {
		throw new ValueError(
			`Operation function is not defined for uid: ${uid}`,
		);
	}

	const displayEntryLabel = windowDefinition.displayEntryLabel;

	if (!displayEntryLabel || typeof operationFunction !== 'function') {
		throw new ValueError(
			`"displayEntryLabel" function is not defined for uid: ${uid}`,
		);
	}

	// const confirmTextKey = `${dataSource}.action.${actionName}.confirmText`;
	//
	// const translationsKeys = useMemo(
	// 	() =>
	// 		[
	// 			confirmTextKey,
	// 			'app.error.form',
	// 			'dashboard.text.selected_entries_one',
	// 			'dashboard.text.selected_entries_many',
	// 		] as const,
	// 	[confirmTextKey],
	// );
	//
	// const { translations, isTranslationLoading } =
	// 	useTranslation(translationsKeys);

	if (windowDefinition.entriesSelection === 'single' && entries.length > 1) {
		throw new ValueError(`Multiple entries provided for single action`);
	}

	const handleAction = async () => {
		setLoading(true);

		try {
			const fetchResponse = await operationFunction(
				entries.map((e) => e.id as number),
			);

			await refreshDataTable(dataSource);

			showToast({
				severity: fetchResponse?.success ? 'success' : 'error',
				summary: fetchResponse?.success ? 'Success' : 'Error',
				detail:
					fetchResponse?.message || translations['app.error.form'],
			});

			onCloseAction();

			// if (onSuccessAction) {
			// 	onSuccessAction(actionName);
			// }
		} catch (error) {
			showToast({
				severity: 'error',
				summary: 'Error',
				detail:
					error instanceof ValueError || error instanceof ApiError
						? error.message
						: translations['app.error.form'],
			});

			onCloseAction();
		} finally {
			setLoading(false);
		}
	};

	const actionContentEntries = displayActionEntries(
		dataSource,
		actionEntries,
	);

	// if (isTranslationLoading) {
	// 	return <LoadingComponent />;
	// }

	return (
		<>
			<p className="pb-4 font-semibold">
				{replaceVars(
					actionContentEntries.length === 1
						? translations['dashboard.text.selected_entries_one']
						: translations['dashboard.text.selected_entries_many'],
					{
						count: actionContentEntries.length.toString(),
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
			<p className="pb-4 font-semibold">
				{translations[confirmTextKey] ||
					`Are you sure you want to ${actionName.toLowerCase()} these entries?`}
			</p>

			<div className="flex justify-end gap-3">
				<Button
					variant="outline"
					hover="warning"
					onClick={onCloseAction}
					title="Cancel"
					disabled={loading}
				>
					<Icons.Action.Cancel />
					Cancel
				</Button>
				<ActionButton
					dataSource={windowConfig.key}
					action={actionName}
					buttonProps={actionProps.buttonProps}
					handleClick={handleAction}
					disabled={loading}
				/>
			</div>
		</>
	);
}
