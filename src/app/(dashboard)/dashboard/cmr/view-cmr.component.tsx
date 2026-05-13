'use client';

import { formatDate } from '@/helpers/date.helper';
import { DisplayStatus } from '@/helpers/display.helper';
import { formatEnumLabel } from '@/helpers/string.helper';
import { displayAddressLabel } from '@/models/address.model';
import { displayClientLabel } from '@/models/client.model';
import type { CmrModel } from '@/models/cmr.model';

export function ViewCmr({ entry }: { entry: CmrModel }) {
	console.log(entry);

	return (
		<div className="space-y-6">
			<div className="space-y-1">
				<div>
					<span className="font-semibold">ID</span> {entry.id}
				</div>
				<div>
					<span className="font-semibold">Type</span>{' '}
					{formatEnumLabel(entry.transport_type)}
				</div>
				<div className="flex items-center gap-2">
					<span className="font-semibold">Status</span>{' '}
					<div className="max-w-60">
						<DisplayStatus
							status={entry.status}
							dataSourceKey="cmr"
						/>
					</div>
				</div>

				<div>
					<span className="font-semibold">Tracking Number</span>{' '}
					{entry.tracking_number}
				</div>
				<div>
					<span className="font-semibold">Pickup Address</span>{' '}
					{displayAddressLabel(entry.pickup_address)}
				</div>
				<div>
					<span className="font-semibold">Delivery Address</span>{' '}
					{displayAddressLabel(entry.delivery_address)}
				</div>
			</div>

			<div>
				<h3 className="font-bold border-b border-line pb-2 mb-3">
					Contact
				</h3>
				<div className="ml-4 space-y-1 text-sm">
					<div>
						<span className="font-semibold">Client</span>{' '}
						{displayClientLabel(entry.client)}
					</div>
					<div>
						<span className="font-semibold">Contact - Name</span>{' '}
						{entry.contact_name}
					</div>
					<div>
						<span className="font-semibold">Contact - Email</span>{' '}
						{entry.contact_email}
					</div>
					<div>
						<span className="font-semibold">Contact - Phone</span>{' '}
						{entry.contact_phone}
					</div>
				</div>
			</div>

			<div>
				<h3 className="font-bold border-b border-line pb-2 mb-3">
					Sign Details
				</h3>
				<div className="ml-4 space-y-1 text-sm">
					<div>
						<span className="font-semibold">Signed At</span>{' '}
						{formatDate(entry.signed_at, 'date-time')}
					</div>
					<div>
						<span className="font-semibold">Signed By</span>{' '}
						{entry.signed_by}
					</div>
				</div>
			</div>

			<div>
				<h3 className="font-bold border-b border-line pb-2 mb-3">
					Timestamps
				</h3>
				<div className="ml-4 space-y-1 text-sm">
					<div>
						<span className="font-semibold">Ordered At</span>{' '}
						{formatDate(entry.ordered_at, 'date-time')}
					</div>
					<div>
						<span className="font-semibold">Pick Scheduled At</span>{' '}
						{formatDate(entry.pick_scheduled_at, 'date-time')}
					</div>
					<div>
						<span className="font-semibold">
							Estimated Delivery At
						</span>{' '}
						{formatDate(entry.estimated_delivery_at, 'date-time')}
					</div>
					<div>
						<span className="font-semibold">Delivered At</span>{' '}
						{formatDate(entry.delivered_at, 'date-time')}
					</div>
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
							<span className="text-red-500">
								{formatDate(entry.deleted_at, 'date-time')}
							</span>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
