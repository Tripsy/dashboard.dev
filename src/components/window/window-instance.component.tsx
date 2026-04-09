'use client';

import { useMemo } from 'react';
import { Modal } from '@/components/ui/modal';
import { WindowForm } from '@/components/window/window-form.component';
import { useTranslation } from '@/hooks/use-translation.hook';
import { useModalStore } from '@/stores/window.store';
import type { WindowConfig } from '@/types/window.type';

export function WindowInstance({ current }: { current: WindowConfig }) {
	const { close, minimize } = useModalStore();

	const handleClose = () => close(current.uid);
	const handleMinimize = () => minimize(current.uid);

	const windowTitleKey = `${current.key}.action.${current.action}.title`;

	const translationsKeys = useMemo(
		() => [windowTitleKey] as const,
		[windowTitleKey],
	);

	const { translations } = useTranslation(translationsKeys);

	const uid = current.uid;
	const definition = current.definition;
	const data = current?.data;

	const windowProps = current.props;
	const configPropsSize = windowProps?.size || 'md';
	const configPropsTitle = windowProps?.title || translations[windowTitleKey];
	const configPropsClassName = windowProps?.className;

	const instanceType = definition?.windowType || 'other';
	const WindowComponent = definition?.windowComponent;

	if (!WindowComponent) {
		throw new Error(`Component not defined for ${instanceType}`);
	}

	// const modalContentForm = <FormOperation extends string>({
	// 	formOperation,
	// 	formSubmitButton,
	// }: {
	// 	formOperation: FormOperation;
	// 	formSubmitButton?: ActionButtonPropsType;
	// }) => {
	// 	return (
	// 		<WindowForm
	// 			uid={uid}
	// 			formOperation={current.action}
	// 			// formSubmitButton={formSubmitButton}
	// 			// getFormValues={
	// 			// 	dataSourceConfigUsers.actions.create.getFormValues
	// 			// }
	// 			// validateForm={dataSourceConfigUsers.actions.create.validateForm}
	// 			// dataSource={dataSource}
	// 			// actionEntry={actionEntry}
	// 			// prefillEntry={current?.prefillEntry}
	// 			// onSuccessAction={onSuccessAction}
	// 		>
	// 			<WindowComponent />
	// 		</WindowForm>
	// 	);
	// };

	const modalContent = () => {
		if (instanceType === 'view') {
			const entry = data?.entries?.[0] ?? null;

			if (!entry) {
				throw new Error(`Entry not defined for ${instanceType}`);
			}

			return <WindowComponent entry={entry} />;
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

		if (instanceType === 'form') {
			// if (action === 'update') {
			//
			// }
			const entry = data?.entries?.[0] ?? null;

			if (!entry) {
				throw new Error(`Entry not defined for ${instanceType}`);
			}

			return (
				<WindowForm uid={uid} formOperation={current.action}>
					<WindowComponent />
				</WindowForm>
			);
		}

		// Other
		return <WindowComponent />;
	};

	return (
		<Modal
			key={`modal-${uid}`}
			size={configPropsSize}
			className={configPropsClassName}
			isOpen={true}
			title={configPropsTitle}
			onClose={handleClose}
			onMinimize={handleMinimize}
		>
			{modalContent()}
		</Modal>
	);
}
