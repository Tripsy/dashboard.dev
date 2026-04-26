'use client';

import { formatDate } from '@/helpers/date.helper';
import { formatEnumLabel } from '@/helpers/string.helper';
import { getClientDisplayName } from '@/models/client.model';
import type { ClientAddressModel } from '@/models/client-address.model';

export function ViewClientAddress({ entry }: { entry: ClientAddressModel }) {
	return (
		<div className="space-y-6">
			<div className="space-y-1">
				<div>
					<span className="font-semibold">ID</span> {entry.id}
				</div>
				<div>
					<span className="font-semibold">Client</span>{' '}
					{getClientDisplayName(entry.client)}
				</div>
				<div>
					<span className="font-semibold">Address Type</span>{' '}
					{formatEnumLabel(entry.address_type)}
				</div>
			</div>

			<div>
				<h3 className="font-bold border-b border-line pb-2 mb-3">
					Details
				</h3>
				<div className="ml-4 space-y-1 text-sm">
					<div>
						<span className="font-semibold">Address - Info</span>{' '}
						{entry.details}
					</div>
					<div>
						<span className="font-semibold">
							Address - Postal Code
						</span>{' '}
						{entry.postal_code}
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
				</div>
			</div>
		</div>
	);
}
