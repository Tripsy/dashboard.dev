'use client';

import clsx from 'clsx';
import type React from 'react';
import { useEffect, useMemo } from 'react';
import { useStore } from 'zustand/react';
import { ActionManage } from '@/app/(dashboard)/_components/action-manage.component';
import { FormManage } from '@/app/(dashboard)/_components/form-manage.component';
import { useDataTable } from '@/app/(dashboard)/_providers/data-table-provider';
import { getActionIcon, Icons } from '@/components/icon.component';
import { type DataSourceType, getDataSourceConfig } from '@/config/data-source';
import { useTranslation } from '@/hooks';
import { useToast } from '@/providers/toast.provider';

type ModalsMap = {
	[key: string]: React.ReactNode;
};

type ModalClassMap = {
	[key: string]: string; // ex: "max-w-4xl bg-base-100/90"
};

export function DataTableModal<K extends keyof DataSourceType>({
	modals,
	modalClass,
	defaultModalClass = 'bg-base-100 rounded-lg w-full max-w-lg relative max-h-[80vh] flex flex-col mx-4',
}: {
	modals?: ModalsMap;
	modalClass?: ModalClassMap;
	defaultModalClass?: string;
}) {
	const { dataSource, dataTableStore } = useDataTable();
	const { showToast } = useToast();

	const isOpen = useStore(dataTableStore, (state) => state.isOpen);
	const actionName = useStore(dataTableStore, (state) => state.actionName);
	const actionEntry = useStore(dataTableStore, (state) => state.actionEntry);
	const closeOut = useStore(dataTableStore, (state) => state.closeOut);
	const actions = getDataSourceConfig(dataSource, 'actions');

	if (!actions) {
		throw new Error(`Actions must be defined for ${dataSource}`);
	}

	const actionMode = actionName ? actions[actionName]?.mode : null;
	const actionType =
		(actionName && actions[actionName]?.type) || actionName || 'undefined';

	const actionTitleKey = `${dataSource}.action.${actionName}.title`;

	const translationsKeys = useMemo(
		() =>
			[
				actionTitleKey,
				'app.text.error_title',
				'dashboard.text.select_one',
			] as const,
		[actionTitleKey],
	);

	const { translations } = useTranslation(translationsKeys);

	useEffect(() => {
		if (
			isOpen &&
			actionName &&
			['update', 'view'].includes(actionType) &&
			!actionEntry
		) {
			showToast({
				severity: 'error',
				summary: translations['app.text.error_title'],
				detail: translations['dashboard.text.select_one'],
			});

			return;
		}
	}, [actionEntry, actionName, actionType, isOpen, showToast, translations]);

	const handleClose = () => {
		closeOut();
	};

	if (!isOpen || !actionName) {
		return null;
	}

	// Dynamically compute modal class
	const modalClassComputed = clsx(
		defaultModalClass,
		modalClass?.[actionName], // Per-action override
	);

	const ActionButtonIcon = getActionIcon(actionType);

	const ModalComponent = modals?.[actionName] ?? null;

	return (
		<div className="fixed inset-0 bg-base-300/90 flex items-center justify-center h-full z-100">
			<div className={modalClassComputed}>
				<div className="flex justify-between px-4 py-3 rounded-t-lg shadow-lg">
					<h1 className="text-lg font-semibold">
						<ActionButtonIcon /> {translations[actionTitleKey]}
					</h1>
					<div>
						<button
							type="button"
							aria-label="Close"
							title="Close"
							onClick={handleClose}
							className="opacity-80 hover:opacity-100 transition-all duration-150 cursor-pointer"
						>
							<Icons.Action.Cancel className="text-2xl" />
						</button>
					</div>
				</div>
				<div className="bg-base-200 flex-1 overflow-y-auto p-4">
					{actionMode === 'other' && ModalComponent}
					{actionMode === 'form' && (
						<FormManage<K>
							key={
								'form-' +
								(actionEntry?.id
									? `${actionName}-${actionEntry.id}`
									: actionName)
							}
						>
							{ModalComponent}
						</FormManage>
					)}
					{actionMode === 'action' && (
						<ActionManage key={`action-${actionName}`} />
					)}
				</div>
			</div>
		</div>
	);
}
