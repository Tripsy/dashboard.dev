'use client';

import { WindowForm } from '@/components/window/window-form.component';
import {useModalStore, WindowConfig} from '@/stores/window.store';
import { Modal } from '@/components/ui/modal';
import {DataTableActionModal} from "@/components/window/window-action.component";

export function WindowInstance({ current, }: { current: WindowConfig; }) {
	const { close, minimize, definition } = useModalStore();

	const handleClose = () => close(current.uid);
	const handleMinimize = () => minimize(current.uid);

	const uid = current.uid;
	const data = current?.data;
	const configProps = current.props;

	// const defintions = definition(current?.module);

	// const actions = useMemo(() => {
	// 	if (!dataSource) {
	// 		return null;
	// 	}
	//
	// 	return getDataSourceConfig(dataSource, 'actions');
	// }, [dataSource]);
	//
	// const action = actionName ? actions?.[actionName] : null;
	// const actionMode = action?.mode ?? null;
	// const ActionComponent = action?.component ?? null;
	// const actionTitleKey = `${dataSource}.action.${actionName}.title`;

	// if (!actions) {
	// 	throw new Error(`Actions must be defined for ${dataSource}`);
	// }

	const instanceType = data?.type || 'other';
	const InstanceComponent = data?.component;

	if (!InstanceComponent) {
		throw new Error(`Component not defined for ${instanceType}`);
	}

	const modalContentForm = ({
		formType,
	}: {
		formType: 'create' | 'update';
	}) => {

		return (
			<WindowForm
				uid={uid}
				formType={formType}
				// dataSource={dataSource}
				// actionEntry={actionEntry}
				// prefillEntry={current?.prefillEntry}
				// onSuccessAction={onSuccessAction}
			>
				<InstanceComponent />
			</WindowForm>
		)
	}

	const modalContent = () => {
		if (instanceType === 'view') {
			const entry = data?.entries?.[0] ?? null;

			if (!entry) {
				throw new Error(`Entry not defined for ${instanceType}`);
			}

			return (
				<InstanceComponent entry={entry} />
			);
		}

		if (instanceType === 'other') {
			const entries = data?.entries;

			if (!entries) {
				throw new Error(`Entries not defined for ${instanceType}`);
			}

			return (
				<InstanceComponent entries={entries} />
			);
		}

		// TODO
		// if (instanceType === 'action') {
		// 	const entries = data?.entries;
		//
		// 	if (!entries) {
		// 		throw new Error(`Entries not defined for ${instanceType}`);
		// 	}
		//
		// 	return (
		// 		<DataTableActionModal
		// 			key={`action-${actionName}`}
		// 			dataSource={dataSource}
		// 			actionName={actionName}
		// 			actionEntries={actionEntries}
		// 			onCloseAction={close}
		// 		/>
		// 	);
		// }

		if (instanceType === 'update') {
			const entry = data?.entries?.[0] ?? null;

			if (!entry) {
				throw new Error(`Entry not defined for ${instanceType}`);
			}

			return modalContentForm({
				formType: 'update',
			});
		}
	};

	return (
		<Modal
			key={`modal-${uid}`}
			size={configProps.size}
			className={configProps.className}
			isOpen={true}
			title={configProps.title}
			onClose={handleClose}
			onMinimize={handleMinimize}
		>
			{modalContent()}
		</Modal>
	);
}
