'use client';

import type React from 'react';
import { useEffect, useMemo } from 'react';
import { useStore } from 'zustand/react';
import { DataTableActionManage } from '@/app/(dashboard)/_components/data-table-action-manage.component';
import { FormManage } from '@/app/(dashboard)/_components/form-manage.component';
import { useDataTable } from '@/app/(dashboard)/_providers/data-table-provider';
import { Modal, type ModalSizeType } from '@/components/ui/modal';
import {
	type BaseModelType,
	type DataSourceKey,
	getDataSourceConfig,
} from '@/config/data-source.config';
import { useTranslation } from '@/hooks/use-translation.hook';
import { useToast } from '@/providers/toast.provider';

type ModalsMap = {
	[key: string]: React.ReactNode;
};

export function DataTableModal<
	K extends DataSourceKey,
	Model extends BaseModelType,
>({
	modals,
	modalsProps,
}: {
	modals?: ModalsMap;
	modalsProps?: {
		[key: string]: {
			size: ModalSizeType;
			className?: string;
		};
	};
}) {
	const { dataSource, dataTableStore } = useDataTable<K, Model>();
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

	const ModalComponent = modals?.[actionName] ?? null;

	return (
		<Modal
			size={modalsProps?.[actionName]?.size || 'md'}
			className={modalsProps?.[actionName]?.className}
			isOpen={isOpen}
			title={translations[actionTitleKey]}
			onClose={handleClose}
		>
			{actionMode === 'other' && ModalComponent}
			{actionMode === 'form' && (
				<FormManage
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
				<DataTableActionManage key={`action-${actionName}`} />
			)}
		</Modal>
	);
}
