'use client';

import { Minus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useModalStore } from '@/stores/window.store';
import type { WindowConfig } from '@/types/window.type';

export function WindowMinimizedInstance({
	current,
}: {
	current: WindowConfig;
}) {
	const { close, restore } = useModalStore();

	const handleClose = () => close(current.uid);
	const handleRestore = () => restore(current.uid);

	const data = current?.data;
	const props = current?.props;

	return (
		<div>
			<Button
				variant="ghost"
				className="h-8 w-8 rounded-full shrink-0"
				onClick={handleRestore}
				aria-label="Minimize modal"
			>
				<Minus className="h-4 w-4" />
			</Button>
			<Button
				variant="ghost"
				className="h-8 w-8 rounded-full shrink-0"
				onClick={handleClose}
				aria-label="Close modal"
			>
				<X className="h-4 w-4" />
			</Button>
			{current.uid}
			{props?.title}
		</div>
	);
}
