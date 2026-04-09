import { WindowMinimizedInstance } from '@/components/window/window-minimized-instance.component';
import type { WindowConfig } from '@/types/window.type';

export function WindowDock({ modals }: { modals: WindowConfig[] }) {
	return (
		<>
			{modals.map((current) => (
				<WindowMinimizedInstance key={current.uid} current={current} />
			))}
		</>
	);
}
