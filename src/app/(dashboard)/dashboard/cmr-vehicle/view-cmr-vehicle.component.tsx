'use client';

import { formatDate } from '@/helpers/date.helper';
import type { CmrVehicleModel } from '@/models/cmr-vehicle.model';
import { displayVehicleLabel } from '@/models/vehicle.model';

export function ViewCmrVehicle({ entry }: { entry: CmrVehicleModel }) {
	return (
		<div className="space-y-6">
			<div className="space-y-1">
				<div>
					<span className="font-semibold">ID</span> {entry.id}
				</div>
				<div>
					<span className="font-semibold">Vehicle</span>{' '}
					{displayVehicleLabel(entry.vehicle)}
				</div>
				<div>
					<span className="font-semibold">License Plate</span>{' '}
					{entry.license_plate}
				</div>
				<div>
					<span className="font-semibold">VIN</span>{' '}
					{entry.vin ?? 'n/a'}
				</div>
				<div>
					<span className="font-semibold">Notes</span> {entry.notes}
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
