'use client';

import { useCallback, useEffect, useMemo } from 'react';
import { useStore } from 'zustand/react';
import { addDataTableActionListener } from '@/app/(dashboard)/_events/data-table-action.event';
import { useDataTable } from '@/app/(dashboard)/_providers/data-table.provider';
import { ActionButton } from '@/components/action-button.component';
import {
	type ActionConfigType,
	type DataSourceKey,
	type DataTableCustomEntrySelectedType,
	getDataSourceConfig,
} from '@/config/data-source.config';
import { generateWindowUid } from '@/helpers/window.helper';
import { useTranslation } from '@/hooks/use-translation.hook';
import { hasPermission } from '@/models/auth.model';
import { useAuth } from '@/providers/auth.provider';
import { useToast } from '@/providers/toast.provider';
import { useModalStore } from '@/stores/window.store';
import type { EntriesSelectionType } from '@/types/action.type';
import type { WindowEntryType } from '@/types/window.type';

function buildActionButtons<Entry extends WindowEntryType>(
	position: 'left' | 'right',
	actions: Record<string, ActionConfigType<Entry>>,
	dataSource: string,
	selectedEntries: Entry[],
	allowAction: (
		entries: Entry[],
		permission: string,
		entriesSelection: EntriesSelectionType,
		customEntryCheck?: (entry: Entry) => boolean,
	) => boolean,
	handleAction: (
		actionName: string,
		entries: Entry[],
		actionConfig: ActionConfigType<Entry>,
	) => void,
) {
	return Object.entries(actions)
		.filter(
			([, actionProps]) =>
				actionProps.buttonPosition === position &&
				(selectedEntries.length > 0 ||
					actionProps.entriesSelection === 'free') &&
				allowAction(
					selectedEntries,
					actionProps.permission,
					actionProps.entriesSelection,
					actionProps.customEntryCheck,
				),
		)
		.map(([actionName, actionProps]) => (
			<ActionButton
				key={`button-${dataSource}-${actionName}`}
				dataSource={dataSource}
				action={actionName}
				buttonProps={actionProps.button}
				handleClick={() =>
					handleAction(actionName, selectedEntries, actionProps)
				}
			/>
		));
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

	const allowAction = useCallback(
		(
			entries: Entry[],
			permission: string,
			entriesSelection: EntriesSelectionType,
			customEntryCheck?: (entry: Entry) => boolean,
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

	const resolveActionEntries = useCallback(
		async (
			entries: Entry[],
			entriesSelection: EntriesSelectionType,
			customEntrySelected?: DataTableCustomEntrySelectedType<Entry>,
		) => {
			if (entriesSelection === 'free') {
				return [];
			}

			if (entriesSelection === 'single') {
				if (customEntrySelected) {
					try {
						const resolved = await customEntrySelected(entries[0]);

						return resolved ? [resolved] : [];
					} catch (error) {
						showToast({
							severity: 'error',
							summary: translations['app.text.error_title'],
							detail: (error as Error).message,
						});

						return null;
					}
				}

				return entries[0] ? [entries[0]] : [];
			}

			return entries;
		},
		[showToast, translations],
	);

	const handleAction = useCallback(
		async (
			actionName: string,
			entries: Entry[],
			actionConfig: ActionConfigType<Entry>,
		) => {
			if (
				!allowAction(
					entries,
					actionConfig.permission,
					actionConfig.entriesSelection,
					actionConfig.customEntryCheck,
				)
			) {
				showToast({
					severity: 'error',
					summary: translations['app.text.error_title'],
					detail: translations['app.error.operation_not_allowed'],
				});

				return;
			}

			const actionEntries = await resolveActionEntries(
				entries,
				actionConfig.entriesSelection,
				actionConfig.customEntrySelected,
			);

			if (actionEntries === null) {
				return;
			}

			const uid = generateWindowUid({
				dataSource,
				action: actionName,
				entriesSelection: actionConfig.entriesSelection,
				entries: actionEntries,
			});

			open(
				{
					uid,
					minimized: false,
					section: 'dashboard',
					dataSource: dataSource,
					action: actionName,
					data: {
						entries: actionEntries,
					},
				},
				uid,
			);
		},
		[
			allowAction,
			dataSource,
			resolveActionEntries,
			translations,
			open,
			showToast,
		],
	);

	useEffect(() => {
		return addDataTableActionListener<Entry>(({ actionName, entry }) => {
			const actionProps = actions?.[actionName];

			if (!actionProps) {
				showToast({
					severity: 'error',
					summary: translations['app.text.error_title'],
					detail: `Action "${actionName}" is not defined`,
				});
				return;
			}

			handleAction(actionName, [entry], actionProps).catch((error) => {
				showToast({
					severity: 'error',
					summary: translations['app.text.error_title'],
					detail: (error as Error).message,
				});
			});
		});
	}, [actions, handleAction, showToast, translations]);

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
					)
				: null,
		[actions, dataSource, selectedEntries, allowAction, handleAction],
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
					)
				: null,
		[actions, dataSource, selectedEntries, allowAction, handleAction],
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
