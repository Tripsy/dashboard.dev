'use client';

import { WindowDock } from '@/components/window/window-dock.component';
import { WindowInstance } from '@/components/window/window-instance.component';
import { useModalStore } from '@/stores/window.store';

export function WindowContainer() {
	const { stack } = useModalStore();

	const activeWindow = stack.find((m) => !m.minimized);

	return (
		<>
			{stack.map((current) => {
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

			{stack.length > 0 && (
				<WindowDock modals={stack} active={activeWindow?.uid} />
			)}
		</>
	);
}
