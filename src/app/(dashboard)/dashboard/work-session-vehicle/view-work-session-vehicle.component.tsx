'use client';

import { formatDate } from '@/helpers/date.helper';
import { DisplayStatus } from '@/helpers/display.helper';
import { getCompanyVehicleDisplayName } from '@/models/company-vehicle.model';
import type { WorkSessionVehicleModel } from '@/models/work-session-vehicle.model';

export function ViewWorkSessionVehicle({
	entry,
}: {
	entry: WorkSessionVehicleModel;
}) {
	return (
		<div className="space-y-6">
			<div className="space-y-1">
				<div>
					<span className="font-semibold">ID</span> {entry.id}
				</div>
				<div>
					<span className="font-semibold">Vehicle</span>{' '}
					{getCompanyVehicleDisplayName(entry.company_vehicle)}
				</div>
				<div className="flex items-center gap-2">
					<span className="font-semibold">Status</span>{' '}
					<div className="max-w-60">
						<DisplayStatus status={entry.status} />
					</div>
				</div>
			</div>

			<div>
				<h3 className="font-bold border-b border-line pb-2 mb-3">
					Info
				</h3>
				<div className="ml-4 space-y-1 text-sm">
					<div>
						<span className="font-semibold">Start (km)</span>{' '}
						{entry.vehicle_km_start ?? 'n/a'}
					</div>
					<div>
						<span className="font-semibold">End (km)</span>{' '}
						{entry.vehicle_km_end ?? 'n/a'}
					</div>
				</div>
			</div>

			<div>
				<h3 className="font-bold border-b border-line pb-2 mb-3">
					Timestamps
				</h3>
				<div className="ml-4 space-y-1 text-sm">
					<div>
						<span className="font-semibold">Assigned At</span>{' '}
						{formatDate(entry.assigned_at, 'date-time')}
					</div>
					<div>
						<span className="font-semibold">Returned At</span>{' '}
						{formatDate(entry.returned_at, 'date-time') || '-'}
					</div>
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
