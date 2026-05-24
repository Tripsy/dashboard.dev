'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useStore } from 'zustand/react';
import { addDataTableActionListener } from '@/app/(dashboard)/_events/data-table-action.event';
import { useDataTable } from '@/app/(dashboard)/_providers/data-table.provider';
import { ActionButton } from '@/components/action-button.component';
import { getDataSourceConfig } from '@/config/data-source.config';
import { getErrorMessage } from '@/helpers/objects.helper';
import { useTranslation } from '@/hooks/use-translation.hook';
import { hasPermission } from '@/models/auth.model';
import { useAuth } from '@/providers/auth.provider';
import { useToast } from '@/providers/toast.provider';
import { useModalStore } from '@/stores/window.store';
import type { EntriesSelectionType } from '@/types/action.type';
import type {
	DataSourceKey,
	DataSourceModelMap,
} from '@/types/data-source.key';
import {
	type ActionConfigType,
	DataSourceSectionEnum,
} from '@/types/data-source.type';

type HandleActionType<K extends DataSourceKey> = (
	action: string,
	dataSource: DataSourceKey,
	entries: DataSourceModelMap[K][],
	actionConfig?: ActionConfigType<DataSourceModelMap[K]>,
) => void;

type AllowActionType<K extends DataSourceKey> = (
	entries: DataSourceModelMap[K][],
	permission: string,
	entriesSelection: EntriesSelectionType,
	customEntryCheck?: (entry: DataSourceModelMap[K]) => boolean,
) => boolean;

function buildActionButtons<K extends DataSourceKey>(
	position: 'left' | 'right',
	actions: Record<string, ActionConfigType<DataSourceModelMap[K]>>,
	dataSource: DataSourceKey,
	selectedEntries: DataSourceModelMap[K][],
	allowAction: AllowActionType<K>,
	handleAction: HandleActionType<K>,
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
					)
				}
			/>
		));
}

function resolveActionEntries<K extends DataSourceKey>(
	entries: DataSourceModelMap[K][],
	entriesSelection: EntriesSelectionType,
): DataSourceModelMap[K][] {
	if (entriesSelection === 'free') {
		return [];
	}

	if (entriesSelection === 'single') {
		return entries[0] ? [entries[0]] : [];
	}

	return entries;
}

export function DataTableActions<K extends DataSourceKey>() {
	type Entry = DataSourceModelMap[K];

	const { dataSource, selectionMode, dataTableStore } = useDataTable<K>();
	const { auth } = useAuth();
	const { showToast } = useToast();
	const { open } = useModalStore();

	const selectedEntries = useStore(
		dataTableStore,
		(state) => state.selectedEntries,
	);

	const [actions, setActions] = useState<
		Record<string, ActionConfigType<Entry>> | undefined
	>(undefined);

	useEffect(() => {
		getDataSourceConfig(
			DataSourceSectionEnum.DASHBOARD,
			dataSource,
			'actions',
		).then(setActions);
	}, [dataSource]);

	const translationsKeys = useMemo(
		() =>
			[
				'app.error.operation_not_allowed',
				'app.text.error_title',
			] as const,
		[],
	);

	const { translations } = useTranslation(translationsKeys);

	const allowAction: AllowActionType<K> = useCallback(
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

	const handleAction: HandleActionType<K> = useCallback(
		(action, targetDataSource, entries, actionConfig) => {
			const execute = async () => {
				const resolvedActionConfig =
					actionConfig ??
					(
						(await getDataSourceConfig(
							DataSourceSectionEnum.DASHBOARD,
							targetDataSource,
							'actions',
						)) as
							| Record<string, ActionConfigType<Entry>>
							| undefined
					)?.[action];

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
					section: DataSourceSectionEnum.DASHBOARD,
					dataSource: targetDataSource,
					action,
					data: { entries: actionEntries },
				});
			};

			execute().catch(handleActionError);
		},
		[allowAction, open, translations, handleActionError],
	);

	useEffect(() => {
		return addDataTableActionListener<Entry>(
			({ action, dataSource, entries }) => {
				handleAction(action, dataSource, entries);
			},
		);
	}, [handleAction]);

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
