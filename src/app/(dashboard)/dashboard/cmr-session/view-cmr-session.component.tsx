'use client';

import { formatDate } from '@/helpers/date.helper';
import { DisplayStatus } from '@/helpers/display.helper';
import { displayCmrLabel } from '@/models/cmr.model';
import type { CmrSessionModel } from '@/models/cmr-session.model';

export function ViewCmrSession({ entry }: { entry: CmrSessionModel }) {
	return (
		<div className="space-y-6">
			<div className="space-y-1">
				<div>
					<span className="font-semibold">ID</span> {entry.id}
				</div>
				<div>
					<span className="font-semibold">CMR</span>{' '}
					{displayCmrLabel(entry.cmr)}
				</div>
				<div>
					<span className="font-semibold">User</span>{' '}
					{entry.work_session.user.name}
				</div>
				<div className="flex items-center gap-2">
					<span className="font-semibold">Work Session Status</span>{' '}
					<div className="max-w-60">
						<DisplayStatus
							status={entry.work_session.status}
							dataSourceKey="work-session"
						/>
					</div>
				</div>
				<div>
					<span className="font-semibold">Created At</span>{' '}
					{formatDate(entry.created_at, 'date-time')}
				</div>
			</div>
		</div>
	);
}
