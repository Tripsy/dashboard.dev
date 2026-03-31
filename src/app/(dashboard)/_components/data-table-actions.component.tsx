'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useStore } from 'zustand/react';
import { DataTableActionButton } from '@/app/(dashboard)/_components/data-table-action-button.component';
import { useDataTable } from '@/app/(dashboard)/_providers/data-table-provider';
import { useModalStore } from '@/app/(dashboard)/_stores/modal.store';
import {
	type BaseModelType,
	type DataSourceKey,
	type DataTableActionConfigType,
	type DataTableCustomEntrySelectedType,
	getDataSourceConfig,
} from '@/config/data-source.config';
import { useTranslation } from '@/hooks/use-translation.hook';
import { hasPermission } from '@/models/auth.model';
import { useAuth } from '@/providers/auth.provider';
import { useToast } from '@/providers/toast.provider';

export function DataTableActions<
	K extends DataSourceKey,
	Model extends BaseModelType,
>() {
	const [error, setError] = useState<string | null>(null);

	const { dataSource, selectionMode, dataTableStore } = useDataTable<
		K,
		Model
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
			entries: Model[],
			permission: string,
			allowedEntries: 'free' | 'single' | 'multiple',
			customEntryCheck?: (entry: Model) => boolean,
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

	const resolveActionEntries = useCallback(
		async (
			entries: Model[],
			allowedEntries: 'free' | 'single' | 'multiple',
			customEntrySelected?: DataTableCustomEntrySelectedType<Model>,
		) => {
			if (allowedEntries === 'free') {
				return [];
			}

			if (allowedEntries === 'single') {
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

				return entries[0] ? [entries[0] as BaseModelType] : [];
			}

			return entries as BaseModelType[];
		},
		[showToast, translations],
	);

	const handleAction = useCallback(
		async (
			actionName: string,
			entries: Model[],
			actionProps: DataTableActionConfigType<Model, unknown>,
		) => {
			const { customEntryCheck, customEntrySelected } = actionProps;

			if (
				!allowAction(
					entries,
					actionProps.permission,
					actionProps.allowedEntries,
					customEntryCheck,
				)
			) {
				setError(translations['app.error.operation_not_allowed']);
				return;
			}

			const actionEntries = await resolveActionEntries(
				entries,
				actionProps.allowedEntries,
				customEntrySelected,
			);

			if (actionEntries === null) {
				return;
			}

			open({
				dataSource,
				actionName,
				actionEntries,
			});
		},
		[allowAction, dataSource, open, resolveActionEntries, translations],
	);

	useEffect(() => {
		const handleUseDataTableAction = (
			event: CustomEvent<{
				source: string;
				actionName: string;
				entry: Model;
			}>,
		) => {
			const { actionName, entry } = event.detail;
			const actionProps = actions?.[actionName];

			if (!actionProps) {
				setError(
					`'actionProps' action props are not defined for '${actionName}'`,
				);
				return;
			}

			handleAction(actionName, [entry], actionProps);
		};

		window.addEventListener(
			'useDataTableAction',
			handleUseDataTableAction as EventListener,
		);
		return () =>
			window.removeEventListener(
				'useDataTableAction',
				handleUseDataTableAction as EventListener,
			);
	}, [actions, handleAction]);

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

			const { customEntryCheck } = actionProps;

			if (
				!allowAction(
					selectedEntries,
					actionProps.permission,
					actionProps.allowedEntries,
					customEntryCheck,
				)
			) {
				return null;
			}

			return (
				<DataTableActionButton
					key={`button-${actionName}`}
					dataSource={dataSource}
					actionName={actionName}
					buttonProps={actionProps.buttonProps}
					handleClick={() =>
						handleAction(actionName, selectedEntries, actionProps)
					}
				/>
			);
		});
	};

	return (
		<div className="flex flex-wrap gap-4 justify-between min-h-18.5 py-4">
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
