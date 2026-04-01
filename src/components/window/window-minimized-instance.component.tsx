'use client';

import {useModalStore, WindowConfig} from '@/stores/window.store';

export function WindowMinimizedInstance({ current, }: { current: WindowConfig; }) {
	const { close, restore } = useModalStore();

	const handleClose = () => close(current.uid);
	const handleRestore = () => restore(current.uid);

	const data = current?.data;
	const props = current?.props;

	return (
		<div>
			<button onClick={handleRestore}>Restore</button>
			<button onClick={handleClose}>Close</button>
			{props?.title}
		</div>
	);
}
