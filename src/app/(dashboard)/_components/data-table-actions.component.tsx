'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useStore } from 'zustand/react';
import { DataTableActionButton } from '@/app/(dashboard)/_components/data-table-action-button.component';
import { useDataTable } from '@/app/(dashboard)/_providers/data-table-provider';
import {
	type DataSourceModel,
	type DataSourceType,
	getDataSourceConfig,
} from '@/config/data-source';
import { hasPermission } from '@/entities/auth.model';
import { useTranslation } from '@/hooks';
import { useAuth } from '@/providers/auth.provider';
import { useToast } from '@/providers/toast.provider';

export const handleReset = (source: string) => {
	const event = new CustomEvent('filterReset', {
		detail: {
			source: source,
		},
	});

	window.dispatchEvent(event);
};

type ActionKey = 'create' | 'update' | 'delete' | string;

export function DataTableActions() {
	const [error, setError] = useState<string | null>(null);

	const { dataSource, selectionMode, modelStore } = useDataTable();
	const { auth } = useAuth();
	const { showToast } = useToast();

	const openCreate = useStore(modelStore, (state) => state.openCreate);
	const openUpdate = useStore(modelStore, (state) => state.openUpdate);
	const openAction = useStore(modelStore, (state) => state.openAction);
	const setActionEntry = useStore(
		modelStore,
		(state) => state.setActionEntry,
	);
	const selectedEntries = useStore(
		modelStore,
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
		<K extends keyof DataSourceType>(
			entries: DataSourceModel<K>[],
			permission: string,
			allowedEntries: 'free' | 'single' | 'multiple',
			customEntryCheck?: (entry: DataSourceModel<K>) => boolean,
		) => {
			if (allowedEntries === 'single') {
				if (entries.length !== 1) {
					return false;
				}

				if (customEntryCheck && !customEntryCheck(entries[0])) {
					return false;
				}
			}

			if (allowedEntries === 'multiple' && entries.length === 0) {
				return false;
			}

			return hasPermission(auth, permission);
		},
		[auth],
	);

	const handleClick = useCallback(
		<K extends keyof DataSourceType>(
			entries: DataSourceModel<K>[],
			actionName: ActionKey,
			permission: string,
			allowedEntries: 'free' | 'single' | 'multiple',
			customEntryCheck?: (entry: DataSourceModel<K>) => boolean,
		) => {
			if (
				!allowAction(
					entries,
					permission,
					allowedEntries,
					customEntryCheck,
				)
			) {
				setError(translations['app.error.operation_not_allowed']);

				return;
			}

			switch (actionName) {
				case 'create':
					openCreate();
					break;
				case 'update':
					setActionEntry(entries[0]);
					openUpdate();
					break;
				default:
					if (allowedEntries === 'single') {
						setActionEntry(entries[0]);
					}

					openAction(actionName);
					break;
			}
		},
		[
			allowAction,
			openAction,
			openCreate,
			openUpdate,
			setActionEntry,
			translations,
		],
	);

	const renderActions = (position: 'left' | 'right') => {
		if (!actions) {
			return null;
		}

		return Object.entries(actions).map(([actionName, actionProps]) => {
			if (
				selectedEntries.length === 0 &&
				actionProps.allowedEntries !== 'free'
			) {
				return null;
			}

			if (actionProps.position !== position) {
				return null;
			}

			const customCheck = actionProps.customEntryCheck as
				| ((entry: unknown) => boolean)
				| undefined;

			if (
				!allowAction(
					selectedEntries,
					actionProps.permission,
					actionProps.allowedEntries,
					customCheck,
				)
			) {
				return null;
			}

			return (
				<DataTableActionButton
					key={`button-${actionName}`}
					dataSource={dataSource}
					actionName={actionName}
					className={actionProps.button?.className}
					handleClick={() =>
						handleClick(
							selectedEntries,
							actionName,
							actionProps.permission,
							actionProps.allowedEntries,
							customCheck,
						)
					}
				/>
			);
		});
	};

	useEffect(() => {
		const handleUseDataTableAction = <K extends keyof DataSourceType>(
			event: CustomEvent<{
				source: string;
				actionName: string;
				entry: DataSourceModel<K>;
			}>,
		) => {
			const actionName = event.detail.actionName;
			const actionProps = actions?.[actionName];

			if (!actionProps) {
				setError(
					`'actionProps' action props are not defined for '${actionName}'`,
				);

				return;
			}

			const customCheck = actionProps.customEntryCheck as
				| ((entry: unknown) => boolean)
				| undefined;

			handleClick(
				[event.detail.entry],
				actionName,
				actionProps.permission,
				actionProps.allowedEntries,
				customCheck,
			);
		};

		// Attach listener
		window.addEventListener(
			'useDataTableAction',
			handleUseDataTableAction as EventListener,
		);

		// Cleanup on unmount
		return () => {
			window.removeEventListener(
				'useDataTableAction',
				handleUseDataTableAction as EventListener,
			);
		};
	}, [actions, handleClick]);

	useEffect(() => {
		if (error) {
			showToast({
				severity: 'error',
				summary: translations['app.text.error_title'],
				detail: error,
			});

			setError(null);
		}
	}, [error, showToast, translations]);

	if (error) {
		return;
	}

	return (
		<div className="flex flex-wrap gap-4 justify-between min-h-18 py-4">
			<div className="flex flex-wrap gap-4 items-center">
				{selectionMode === 'multiple' && (
					<div>{selectedEntries.length} selected</div>
				)}
				{renderActions('left')}
			</div>
			<div className="flex flex-wrap gap-4">{renderActions('right')}</div>
		</div>
	);
}
