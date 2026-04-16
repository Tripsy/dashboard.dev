'use client';

import { useCallback, useEffect, useMemo } from 'react';
import { useStore } from 'zustand/react';
import { addDataTableActionListener } from '@/app/(dashboard)/_events/data-table-action.event';
import { useDataTable } from '@/app/(dashboard)/_providers/data-table.provider';
import { ActionButton } from '@/components/action-button.component';
import {
	type ActionConfigType,
	type DataSourceKey,
	getDataSourceConfig,
} from '@/config/data-source.config';
import { getErrorMessage } from '@/helpers/objects.helper';
import { generateWindowUid } from '@/helpers/window.helper';
import { useTranslation } from '@/hooks/use-translation.hook';
import { hasPermission } from '@/models/auth.model';
import { useAuth } from '@/providers/auth.provider';
import { useToast } from '@/providers/toast.provider';
import { useModalStore } from '@/stores/window.store';
import type { EntriesSelectionType } from '@/types/action.type';
import type { WindowEntryType } from '@/types/window.type';

type HandleActionType = (
	action: string,
	dataSource: DataSourceKey,
	entries: WindowEntryType[],
	actionConfig?: ActionConfigType,
) => Promise<void>;

type AllowActionType = (
	entries: WindowEntryType[],
	permission: string,
	entriesSelection: EntriesSelectionType,
	customEntryCheck?: (entry: WindowEntryType) => boolean,
) => boolean;

function buildActionButtons(
	position: 'left' | 'right',
	actions: Record<string, ActionConfigType>,
	dataSource: DataSourceKey,
	selectedEntries: WindowEntryType[],
	allowAction: AllowActionType,
	handleAction: HandleActionType,
	handleActionError: (error: unknown) => void,
) {
	return Object.entries(actions)
		.filter(
			([, actionConfig]) =>
				actionConfig.buttonPosition === position &&
				(selectedEntries.length > 0 ||
					actionConfig.entriesSelection === 'free') &&
				allowAction(
					selectedEntries,
					actionConfig.permission,
					actionConfig.entriesSelection,
					actionConfig.customEntryCheck,
				),
		)
		.map(([action, actionConfig]) => (
			<ActionButton
				key={`button-${dataSource}-${action}`}
				dataSource={dataSource}
				action={action}
				buttonProps={actionConfig.button}
				handleClick={() =>
					handleAction(
						action,
						dataSource,
						selectedEntries,
						actionConfig,
					).catch(handleActionError)
				}
			/>
		));
}

function resolveActionEntries(
	entries: WindowEntryType[],
	entriesSelection: EntriesSelectionType,
): WindowEntryType[] {
	if (entriesSelection === 'free') {
		return [];
	}

	if (entriesSelection === 'single') {
		return entries[0] ? [entries[0]] : [];
	}

	return entries;
}

export function DataTableActions<
	K extends DataSourceKey,
	Entry extends WindowEntryType,
>() {
	const { dataSource, selectionMode, dataTableStore } = useDataTable<
		K,
		Entry
	>();
	const { auth } = useAuth();
	const { showToast } = useToast();
	const { open } = useModalStore();

	const selectedEntries = useStore(
		dataTableStore,
		(state) => state.selectedEntries,
	);

	const actions = useMemo(
		() => getDataSourceConfig(dataSource, 'actions'),
		[dataSource],
	);

	const translationsKeys = useMemo(
		() =>
			[
				'app.error.operation_not_allowed',
				'app.text.error_title',
			] as const,
		[],
	);

	const { translations } = useTranslation(translationsKeys);

	const allowAction: AllowActionType = useCallback(
		(
			entries: WindowEntryType[],
			permission: string,
			entriesSelection: EntriesSelectionType,
			customEntryCheck?: (entry: WindowEntryType) => boolean,
		) => {
			if (entriesSelection === 'single') {
				if (entries.length !== 1) {
					return false;
				}

				if (customEntryCheck && !customEntryCheck(entries[0])) {
					return false;
				}
			}

			if (entriesSelection === 'multiple' && entries.length === 0) {
				return false;
			}

			return hasPermission(auth, permission);
		},
		[auth],
	);

	const handleAction: HandleActionType = useCallback(
		async (action, targetDataSource, entries, actionConfig) => {
			const resolvedActionConfig: ActionConfigType | undefined =
				actionConfig ??
				getDataSourceConfig(targetDataSource, 'actions')?.[action];

			if (!resolvedActionConfig) {
				throw new Error(`Action "${action}" is not defined`);
			}

			if (
				!allowAction(
					entries,
					resolvedActionConfig.permission,
					resolvedActionConfig.entriesSelection,
					resolvedActionConfig.customEntryCheck,
				)
			) {
				throw new Error(
					translations['app.error.operation_not_allowed'],
				);
			}

			const actionEntries = resolveActionEntries(
				entries,
				resolvedActionConfig.entriesSelection,
			);

			open({
				minimized: false,
				section: 'dashboard',
				dataSource: targetDataSource,
				action: action,
				data: {
					entries: actionEntries,
				},
			});
		},
		[allowAction, open, translations],
	);

	const handleActionError = useCallback(
		(error: unknown) => {
			showToast({
				severity: 'error',
				summary: translations['app.text.error_title'],
				detail: getErrorMessage(error),
			});
		},
		[showToast, translations],
	);

	useEffect(() => {
		return addDataTableActionListener<Entry>(
			({ action, dataSource, entries }) => {
				handleAction(action, dataSource, entries).catch(
					handleActionError,
				);
			},
		);
	}, [handleAction, handleActionError]);

	const leftActions = useMemo(
		() =>
			actions
				? buildActionButtons(
						'left',
						actions,
						dataSource,
						selectedEntries,
						allowAction,
						handleAction,
						handleActionError,
					)
				: null,
		[
			actions,
			dataSource,
			selectedEntries,
			allowAction,
			handleAction,
			handleActionError,
		],
	);

	const rightActions = useMemo(
		() =>
			actions
				? buildActionButtons(
						'right',
						actions,
						dataSource,
						selectedEntries,
						allowAction,
						handleAction,
						handleActionError,
					)
				: null,
		[
			actions,
			dataSource,
			selectedEntries,
			allowAction,
			handleAction,
			handleActionError,
		],
	);

	return (
		<div className="flex flex-wrap gap-4 justify-between min-h-18.5 py-4">
			<div className="flex flex-wrap gap-4 items-center">
				{selectionMode === 'multiple' && (
					<div>{selectedEntries.length} selected</div>
				)}
				{leftActions}
			</div>
			<div className="flex flex-wrap gap-4">{rightActions}</div>
		</div>
	);
}
