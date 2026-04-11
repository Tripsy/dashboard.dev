import { useState } from 'react';
import { Icons } from '@/components/icon.component';
import { Button } from '@/components/ui/button';
import { WindowMinimizedInstance } from '@/components/window/window-minimized-instance.component';
import { useModalStore } from '@/stores/window.store';
import type { WindowConfig } from '@/types/window.type';

export function WindowDock({
	modals,
	active,
}: {
	modals: WindowConfig[];
	active?: string;
}) {
	const [showAll, setShowAll] = useState(false);
	const { closeAll } = useModalStore();

	const reversedModals = [...modals].reverse();
	const displayModals = showAll ? reversedModals : reversedModals.slice(0, 5);
	const hasMore = modals.length > 5;
	const hasWindows = modals.length > 1;

	const handleCloseAll = () => {
		if (confirm(`Close all ${modals.length} windows?`)) {
			closeAll();
		}
	};

	return (
		<div className="fixed bottom-4 right-4 ml-4 z-40 md:z-50 flex flex-wrap gap-2">
			{displayModals.map((current) => (
				<WindowMinimizedInstance
					key={current.uid}
					current={current}
					isActive={current.uid === active}
				/>
			))}
			{hasMore && (
				<div className="flex items-center gap-x-2 border bg-background/95 hover:bg-accent hover:text-accent-foreground shadow-xl px-2 py-1 rounded">
					{!showAll && (
						<Button
							variant="ghost"
							size="xs"
							onClick={() => setShowAll(true)}
							className="hover:bg-transparent hover:text-inherit text-sm"
						>
							<Icons.More size={12} />+{modals.length - 5}
						</Button>
					)}

					{showAll && (
						<Button
							variant="ghost"
							size="xs"
							onClick={() => setShowAll(false)}
							className="hover:bg-transparent hover:text-inherit text-sm"
						>
							<Icons.LessLeft size={12} />
							Show Less
						</Button>
					)}
				</div>
			)}

			{hasWindows && (
				<div className="flex items-center gap-x-2 border bg-background/95 hover:bg-error/80 hover:text-error-foreground px-2 py-1 rounded-full transition-colors">
					<Button
						variant="ghost"
						size="xs"
						onClick={handleCloseAll}
						className="hover:bg-transparent hover:text-error-foreground "
						aria-label="Close all windows"
					>
						<Icons.Close size={12} />
					</Button>
				</div>
			)}
		</div>
	);
}
