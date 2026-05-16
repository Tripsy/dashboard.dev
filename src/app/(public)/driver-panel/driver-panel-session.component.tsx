import { useCallback } from 'react';
import { useWorkSession } from '@/app/(public)/_providers/work-session.provider';
import { Icons } from '@/components/icon.component';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/helpers/date.helper';
import {
	displayWorkSessionDuration,
	type WorkSessionModel,
} from '@/models/work-session.model';
import { useModalStore } from '@/stores/window.store';

export function DriverPanelSession({ session }: { session: WorkSessionModel }) {
	const { open } = useModalStore();
	const { refreshSession } = useWorkSession();

	const handleCloseSession = useCallback(() => {
		open({
			minimized: false,
			section: 'public',
			dataSource: 'work-session',
			action: 'close',
			data: {
				entries: [session],
			},
			events: {
				success: async () => {
					await refreshSession();
				},
			},
		});
	}, [open, session, refreshSession]);

	return (
		<div className="flex flex-col md:flex-row gap-y-1 font-medium text-muted-foreground bg-card md:border border-r-0 border-border shadow-lg">
			<div className="flex flex-1">
				<div className="bg-muted px-4 py-3 text-xs uppercase tracking-wider w-32 whitespace-nowrap">
					Started at:
				</div>
				<div className="px-4 py-3 text-sm whitespace-nowrap flex items-center">
					<Icons.Calendar className="mr-2 h-4 w-4" />
					{formatDate(session.start_at, undefined, {
						customFormat: 'D MMMM, HH:mm',
					})}
				</div>
			</div>

			<div className="flex flex-1">
				<div className="bg-muted px-4 py-3 text-xs uppercase tracking-wider w-32 whitespace-nowrap">
					Duration:
				</div>
				<div className="px-4 py-3 text-sm whitespace-nowrap flex items-center">
					<Icons.Clock className="mr-2 h-4 w-4" />
					{displayWorkSessionDuration(session)}
				</div>
			</div>

			<div className="flex-1 flex justify-end min-w-48">
				<Button
					size="md"
					className="h-full w-full md:w-auto px-8 text-base font-bold text-background/90 rounded-none"
					variant="error"
					onClick={handleCloseSession}
				>
					Close session
					<Icons.Action.Close className="ml-2 h-5 w-5" />
				</Button>
			</div>
		</div>
	);
}
