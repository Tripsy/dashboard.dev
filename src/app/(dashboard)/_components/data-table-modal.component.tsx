'use client';

import type React from 'react';
import { useMemo } from 'react';
import { DataTableActionModal } from '@/app/(dashboard)/_components/data-table-action-modal.component';
import { FormManage } from '@/app/(dashboard)/_components/form-manage.component';
import { ViewEntry } from '@/app/(dashboard)/_components/view-entry.component';
import { useModalStore } from '@/app/(dashboard)/_stores/modal.store';
import { Modal } from '@/components/ui/modal';
import { getDataSourceConfig } from '@/config/data-source.config';
import { useTranslation } from '@/hooks/use-translation.hook';

export function DataTableModal() {
	const { isOpen, close, current } = useModalStore();

	const dataSource = current?.dataSource;
	const actionName = current?.actionName;
	const actionEntries = current?.actionEntries;
	const onSuccessAction = current?.onSuccess;
	const props = current?.props;

	const actions = useMemo(() => {
		if (!dataSource) {
			return null;
		}

		return getDataSourceConfig(dataSource, 'actions');
	}, [dataSource]);

	const action = actionName ? actions?.[actionName] : null;
	const actionMode = action?.mode ?? null;
	const ActionComponent = action?.component ?? null;
	const actionTitleKey = `${dataSource}.action.${actionName}.title`;

	const translationsKeys = useMemo(
		() => [actionTitleKey],
		[actionTitleKey],
	);

	const { translations } = useTranslation(translationsKeys);

	if (!isOpen || !dataSource) {
		return null;
	}

	if (!actions) {
		throw new Error(`Actions must be defined for ${dataSource}`);
	}

	if (!actionName) {
		throw new Error(`Action name must be defined`);
	}

	if (actionMode === 'action') {
		if (!actionEntries) {
			throw new Error(`No entries selected`);
		}

		return (
			<Modal
				size={props?.size || 'md'}
				className={props?.className}
				isOpen={isOpen}
				title={translations[actionTitleKey]}
				onClose={close}
			>
				<DataTableActionModal
					key={`action-${actionName}`}
					dataSource={dataSource}
					actionName={actionName}
					actionEntries={actionEntries}
					onSuccessAction={onSuccessAction}
					onCloseAction={close}
				/>
			</Modal>
		);
	}

	if (!ActionComponent) {
		throw new Error(
			`Component not defined for ${dataSource} / ${actionName}`,
		);
	}

	if (actionMode === 'form' && !['create', 'update'].includes(actionName)) {
		throw new Error(
			`Invalid action name (eg: ${actionName}) for form mode`,
		);
	}

	const actionEntry = actionEntries ? actionEntries[0] : null;

	return (
		<Modal
			size={props?.size || 'md'}
			className={props?.className}
			isOpen={isOpen}
			title={translations[actionTitleKey]}
			onClose={close}
		>
			{actionMode === 'other' && <ActionComponent />}

			{actionMode === 'view' && (
				<ViewEntry actionEntry={actionEntry ?? null}>
					{ActionComponent}
				</ViewEntry>
			)}

			{actionMode === 'form' && (
				<FormManage
					key={
						actionEntry?.id
							? `${actionName}-${actionEntry.id}`
							: actionName
					}
					dataSource={dataSource}
					actionName={actionName as 'create' | 'update'}
					actionEntry={actionEntry ?? null}
					onSuccessAction={onSuccessAction}
				>
					<ActionComponent />
				</FormManage>
			)}
		</Modal>
	);
}
