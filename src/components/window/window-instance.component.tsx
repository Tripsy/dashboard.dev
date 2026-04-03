'use client';

import { dataSourceConfigUsers } from '@/app/(dashboard)/dashboard/users/users.definition';
import { Modal } from '@/components/ui/modal';
import { WindowForm } from '@/components/window/window-form.component';
import { useModalStore, type WindowConfig } from '@/stores/window.store';
import type { ActionButtonPropsType } from '@/types/html.type';

export function WindowInstance({ current }: { current: WindowConfig }) {
	const { close, minimize } = useModalStore();

	const handleClose = () => close(current.uid);
	const handleMinimize = () => minimize(current.uid);

	const uid = current.uid;
	const definition = current.definition;
	// const data = current?.data;

	// // TODO probably a spread with definition `windowConfigProps`
	// const windowProps = current.props;
	//
	// // TODO this should take in consideration the value from definition `windowConfigProps`
	// const configPropsSize = windowProps?.size || 'md';
	//
	// // TODO this should take in consideration the value from definition `windowConfigProps`
	// const configPropsTitle = windowProps?.title || `${definition.key}.action.${definition.action}.title`;


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

	const instanceType = definition?.windowType || 'other';
	const WindowComponent = definition?.windowComponent;

	if (!WindowComponent) {
		throw new Error(`Component not defined for ${instanceType}`);
	}

	const modalContentForm = <FormOperation extends string>({
		formOperation,
		formSubmitButton,
	}: {
		formOperation: FormOperation;
		formSubmitButton?: ActionButtonPropsType;
	}) => {
		return (
			<WindowForm
				uid={uid}
				formOperation={formOperation}
				formSubmitButton={formSubmitButton}
				getFormValues={
					dataSourceConfigUsers.actions.create.getFormValues
				}
				validateForm={dataSourceConfigUsers.actions.create.validateForm}
				// dataSource={dataSource}
				// actionEntry={actionEntry}
				// prefillEntry={current?.prefillEntry}
				// onSuccessAction={onSuccessAction}
			>
				<WindowComponent />
			</WindowForm>
		);
	};

	const modalContent = () => {
		if (instanceType === 'view') {
			const entry = data?.entries?.[0] ?? null;

			if (!entry) {
				throw new Error(`Entry not defined for ${instanceType}`);
			}

			return <WindowComponent entry={entry} />;
		}

		if (instanceType === 'other') {
			const entries = data?.entries;

			if (!entries) {
				throw new Error(`Entries not defined for ${instanceType}`);
			}

			return <WindowComponent entries={entries} />;
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

		// if (instanceType === 'update') {
		// 	const entry = data?.entries?.[0] ?? null;
		//
		// 	if (!entry) {
		// 		throw new Error(`Entry not defined for ${instanceType}`);
		// 	}
		//
		// 	return modalContentForm({
		// 		formOperation: 'update' as any,
		// 		formSubmitButton: data.formSubmitButton,
		// 	});
		// }
	};

	return (
		<Modal
			key={`modal-${uid}`}
			size={configPropsSize}
			className={configProps.className}
			isOpen={true}
			// title={configPropsTitle}
			onClose={handleClose}
			onMinimize={handleMinimize}
		>
			{modalContent()}
		</Modal>
	);
}
