'use client';

import { WindowDock } from '@/components/window/window-dock.component';
import { WindowInstance } from '@/components/window/window-instance.component';
import { useModalStore } from '@/stores/window.store';

export function WindowContainer() {
	const { stack } = useModalStore();

	const activeWindow = stack.find((m) => !m.minimized);

	return (
		<>
			{activeWindow && (
				<WindowInstance key={activeWindow.uid} current={activeWindow} />
			)}

			{stack.length > 0 && (
				<WindowDock modals={stack} active={activeWindow?.uid} />
			)}
		</>
	);
}
