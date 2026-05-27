'use client';

import { formatDate } from '@/helpers/date.helper';
import { DisplayStatus } from '@/helpers/display.helper';
import type { VendorModel } from '@/models/vendor.model';

export function ViewVendor({ entry }: { entry: VendorModel }) {
	return (
		<div className="space-y-6">
			<div className="space-y-1">
				<div>
					<span className="font-semibold">ID</span> {entry.id}
				</div>
				<div>
					<span className="font-semibold">Name</span> {entry.name}
				</div>
				<div className="flex items-center gap-2">
					<span className="font-semibold">Status</span>{' '}
					<div className="max-w-60">
						<DisplayStatus
							status={entry.status}
							dataSource="vendor"
						/>
					</div>
				</div>
			</div>

			<div>
				<h3 className="font-bold border-b border-line pb-2 mb-3">
					Timestamps
				</h3>
				<div className="ml-4 space-y-1 text-sm">
					<div>
						<span className="font-semibold">Created At</span>{' '}
						{formatDate(entry.created_at, 'date-time')}
					</div>
					<div>
						<span className="font-semibold">Updated At</span>{' '}
						{formatDate(entry.updated_at, 'date-time') || '-'}
					</div>
					{entry.deleted_at && (
						<div>
							<span className="font-semibold">Deleted At</span>{' '}
							<span className="text-error">
								{formatDate(entry.deleted_at, 'date-time')}
							</span>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
