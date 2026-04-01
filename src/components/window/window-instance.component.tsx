'use client';

import { useMemo } from 'react';
import { DataTableActionModal } from '@/app/(dashboard)/_components/data-table-action-modal.component';
import { FormManage } from '@/app/(dashboard)/_components/form-manage.component';
import { ViewEntry } from '@/app/(dashboard)/_components/view-entry.component';
import { useModalStore } from '@/stores/window.store';
import { Modal } from '@/components/ui/modal';
import { getDataSourceConfig } from '@/config/data-source.config';
import { useTranslation } from '@/hooks/use-translation.hook';

export function DataTableModal() {
	const { isOpen, close, current } = useModalStore();

	const dataSource = current?.dataSource;
	const actionName = current?.actionName;
	const actionEntries = current?.actionEntries;
	const props = current?.props;
	const onSuccessAction = current?.onSuccess;
	const uid = props?.uid || Date.now();

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
		() => [actionTitleKey] as const,
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

	const modalContent = () => {
		if (actionMode === 'action') {
			if (!actionEntries) {
				throw new Error(`No entries selected`);
			}

			return (
				<DataTableActionModal
					key={`action-${actionName}`}
					dataSource={dataSource}
					actionName={actionName}
					actionEntries={actionEntries}
					onCloseAction={close}
				/>
			);
		}

		if (!ActionComponent) {
			throw new Error(
				`Component not defined for ${dataSource} / ${actionName}`,
			);
		}

		if (
			actionMode === 'form' &&
			!['create', 'update'].includes(actionName)
		) {
			throw new Error(
				`Invalid action name (eg: ${actionName}) for form mode`,
			);
		}

		const actionEntry = actionEntries?.[0] ?? null;

		return (
			<>
				{actionMode === 'other' && <ActionComponent />}
				{actionMode === 'view' && (
					<ViewEntry actionEntry={actionEntry}>
						{ActionComponent}
					</ViewEntry>
				)}
				{actionMode === 'form' && (
					<FormManage
						key={`${dataSource}-${actionName}-${uid}`}
						dataSource={dataSource}
						actionName={actionName as 'create' | 'update'}
						actionEntry={actionEntry}
						prefillEntry={current?.prefillEntry}
						onSuccessAction={onSuccessAction}
					>
						<ActionComponent />
					</FormManage>
				)}
			</>
		);
	};

	return (
		<Modal
			size={props?.size || 'md'}
			className={props?.className}
			isOpen={isOpen}
			title={translations[actionTitleKey]}
			onClose={close}
		>
			{modalContent()}
		</Modal>
	);
}
