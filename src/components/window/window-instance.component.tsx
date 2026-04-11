'use client';

import type { ReactNode } from 'react';
import { Modal } from '@/components/ui/modal';
import { WindowAction } from '@/components/window/window-action.component';
import { WindowForm } from '@/components/window/window-form.component';
import {
	displayWindowTitle,
	resolveWindowEntries,
} from '@/helpers/window.helper';
import { useModalStore } from '@/stores/window.store';
import type { EntriesSelectionType } from '@/types/action.type';
import type {
	WindowComponent,
	WindowConfig,
	WindowEntryType,
	WindowType,
} from '@/types/window.type';

type WindowRenderProps = {
	uid: string;
	type: WindowType<EntriesSelectionType>;
	entry: WindowEntryType | undefined;
	entries: WindowEntryType[];
	WindowComponent: WindowComponent | undefined;
};

const WINDOW_RENDERERS: Partial<
	Record<
		WindowType<EntriesSelectionType>,
		(props: WindowRenderProps) => ReactNode
	>
> = {
	view: ({ WindowComponent, entry }) => {
		if (!WindowComponent) {
			throw new Error('Component not defined for view');
		}

		return <WindowComponent entry={entry} />;
	},
	action: ({ uid, entries }) => <WindowAction uid={uid} entries={entries} />,
	form: ({ uid, entry, WindowComponent }) => {
		if (!WindowComponent) {
			throw new Error('Component not defined for form');
		}

		return (
			<WindowForm uid={uid} entry={entry}>
				<WindowComponent />
			</WindowForm>
		);
	},
	other: ({ WindowComponent }) => {
		if (!WindowComponent) {
			throw new Error('Component not defined for other');
		}

		return <WindowComponent />;
	},
};

export function WindowInstance({ current }: { current: WindowConfig }) {
	const { close, minimize } = useModalStore();

	const handleClose = () => close(current.uid);
	const handleMinimize = () => minimize(current.uid);

	const uid = current.uid;
	const definition = current.definition;

	const windowProps = current.props;
	const modalSize = windowProps?.size || 'md';
	const modalClassName = windowProps?.className;

	const type = definition.windowType || 'other';
	const WindowComponent = definition?.windowComponent;

	const { entry, entries } = resolveWindowEntries(current, type);

	const modalTitle =
		windowProps?.title ||
		displayWindowTitle({
			entriesSelection: definition.entriesSelection,
			entriesCount: entries.length,
			entryLabel:
				definition.entriesSelection === 'single' &&
				definition.displayEntryLabel &&
				entry
					? definition.displayEntryLabel(entry)
					: undefined,
			windowTitle: definition.windowTitle,
		});

	const renderer = WINDOW_RENDERERS[type];

	if (!renderer) {
		throw new Error(`No renderer defined for window type "${type}"`);
	}

	return (
		<Modal
			size={modalSize}
			className={modalClassName}
			isOpen={true}
			title={modalTitle}
			onClose={handleClose}
			onMinimize={handleMinimize}
		>
			{renderer({ uid, type, entry, entries, WindowComponent })}
		</Modal>
	);
}
