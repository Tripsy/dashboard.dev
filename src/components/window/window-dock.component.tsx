import { ChevronUp, MoreHorizontal } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { WindowMinimizedInstance } from '@/components/window/window-minimized-instance.component';
import type { WindowConfig } from '@/types/window.type';

export function WindowDock({ modals }: { modals: WindowConfig[] }) {
	const [showAll, setShowAll] = useState(false);

	const displayModals = showAll ? modals : modals.slice(-5);
	const hasMore = modals.length > 5;

	return (
		<div className="fixed bottom-4 right-4 z-50 flex flex-row-reverse gap-2">
			{showAll && hasMore && (
				<Button
					variant="outline"
					size="sm"
					onClick={() => setShowAll(false)}
					className="whitespace-nowrap"
				>
					<ChevronUp className="h-4 w-4 mr-2" />
					Show Less
				</Button>
			)}

			{displayModals.map((current) => (
				<WindowMinimizedInstance key={current.uid} current={current} />
			))}

			{!showAll && hasMore && (
				<Button
					variant="outline"
					size="sm"
					onClick={() => setShowAll(true)}
					className="whitespace-nowrap"
				>
					<MoreHorizontal className="h-4 w-4 mr-2" />+
					{modals.length - 5}
				</Button>
			)}
		</div>
	);
}
