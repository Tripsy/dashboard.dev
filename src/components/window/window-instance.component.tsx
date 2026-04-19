'use client';

import { useQuery } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { LoadingComponent } from '@/components/status.component';
import { Modal } from '@/components/ui/modal';
import { WindowAction } from '@/components/window/window-action.component';
import { WindowForm } from '@/components/window/window-form.component';
import {
	displayWindowTitle,
	resolveWindowEntries,
	WINDOW_CACHE_LABEL,
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
	action: ({ uid, entry, entries }) => {
		const actionEntries: WindowEntryType[] =
			entries.length > 0 ? entries : entry ? [entry] : [];

		if (actionEntries.length === 0) {
			throw new Error('No entries defined for action');
		}

		return <WindowAction uid={uid} entries={actionEntries} />;
	},
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

export function WindowInstance({
	current,
	isHidden,
}: {
	current: WindowConfig;
	isHidden: boolean;
}) {
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

	const { entry: rawEntry, entries } = resolveWindowEntries(current, type);

	const entryId =
		rawEntry && 'id' in rawEntry ? (rawEntry.id as number) : undefined;
	const reloadFn = definition.reloadEntry;

	const { data: reloadedEntry, isLoading: isEntryLoading } = useQuery({
		queryKey: [WINDOW_CACHE_LABEL, current.uid, entryId],
		queryFn: reloadFn && entryId ? () => reloadFn(entryId) : undefined,
		enabled: !!reloadFn && !!entryId,
	});

	const entry = reloadedEntry ?? rawEntry;

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
			isHidden={isHidden}
			title={modalTitle}
			onClose={handleClose}
			onMinimize={handleMinimize}
		>
			{isEntryLoading && definition.reloadEntry ? (
				<LoadingComponent />
			) : (
				renderer({ uid, type, entry, entries, WindowComponent })
			)}
		</Modal>
	);
}
