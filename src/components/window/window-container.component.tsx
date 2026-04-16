'use client';

import { WindowDock } from '@/components/window/window-dock.component';
import { WindowInstance } from '@/components/window/window-instance.component';
import { useModalStore } from '@/stores/window.store';
import type { WindowConfig } from '@/types/window.type';

export function WindowContainer({
	section,
}: {
	section: WindowConfig['section'];
}) {
	const { stack } = useModalStore();

	const modals = stack.filter((m) => m.section === section);
	const activeWindow = modals.find((m) => !m.minimized);

	console.log(section, modals)

	return (
		<>
			{modals.map((current) => {
				const isForm = current.definition.windowType === 'form';
				const isMinimized = current.minimized;

				// Non-form windows: unmount when minimized, no state to preserve
				if (!isForm && isMinimized) {
					return null;
				}

				return (
					<WindowInstance
						key={current.uid}
						current={current}
						isHidden={isMinimized}
					/>
				);
			})}

			{modals.length > 0 && (
				<WindowDock modals={modals} active={activeWindow?.uid} />
			)}
		</>
	);
}
