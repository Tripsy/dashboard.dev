'use client';

import { Icons } from '@/components/icon.component';
import { Button } from '@/components/ui/button';
import { cn } from '@/helpers/css.helper';
import {
	displayWindowTitle,
	resolveWindowEntries,
} from '@/helpers/window.helper';
import { useModalStore } from '@/stores/window.store';
import type { WindowConfig } from '@/types/window.type';

export function WindowMinimizedInstance({
	current,
	isActive,
}: {
	current: WindowConfig;
	isActive: boolean;
}) {
	const { close, restore } = useModalStore();

	const handleClose = () => close(current.uid);
	const handleRestore = () => restore(current.uid);

	const windowProps = current.props;
	const definition = current.definition;

	const type = definition.windowType || 'other';

	const { entry, entries } = resolveWindowEntries(current, type);

	const modalTitle =
		windowProps?.title ||
		displayWindowTitle({
			entriesSelection: definition.entriesSelection,
			entriesCount: entries.length || 0,
			entryLabel:
				definition.entriesSelection === 'single' &&
				definition.displayEntryLabel &&
				entry
					? definition.displayEntryLabel(entry)
					: undefined,
			windowTitle: definition.windowTitle,
		});

	const handleClick = () => {
		if (!isActive) {
			handleRestore();
		}
	};

	return (
		<div
			className={cn(
				'flex items-center gap-x-2 border  shadow-xl px-2 py-1 rounded',
				isActive
					? 'bg-accent text-accent-foreground'
					: 'bg-background/95 hover:bg-accent hover:text-accent-foreground',
			)}
		>
			<button
				type="button"
				className="flex-1 cursor-row-resize text-sm text-ellipsis overflow-hidden max-w-36 whitespace-nowrap"
				onClick={handleClick}
				title={modalTitle}
			>
				{modalTitle}
			</button>
			<div>
				<Button
					variant="ghost"
					className="rounded-full"
					hover="error"
					size="xs"
					onClick={handleClose}
					aria-label="Close modal"
				>
					<Icons.Close size={12} />
				</Button>
			</div>
		</div>
	);
}
