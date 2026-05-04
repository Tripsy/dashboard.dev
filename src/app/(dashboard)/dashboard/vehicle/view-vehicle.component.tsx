'use client';

import { formatDate } from '@/helpers/date.helper';
import { DisplayStatus } from '@/helpers/display.helper';
import { formatEnumLabel } from '@/helpers/string.helper';
import type { VehicleModel } from '@/models/vehicle.model';

export function ViewVehicle({ entry }: { entry: VehicleModel }) {
	return (
		<div className="space-y-6">
			<div className="space-y-1">
				<div>
					<span className="font-semibold">ID</span> {entry.id}
				</div>
				<div>
					<span className="font-semibold">Type</span>{' '}
					{formatEnumLabel(entry.vehicle_type)}
				</div>
				<div>
					<span className="font-semibold">Brand</span>{' '}
					{entry.brand?.name}
				</div>
				<div>
					<span className="font-semibold">Model</span> {entry.model}
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
						<span className="font-semibold">Length (mm)</span>{' '}
						{entry.length ?? 'n/a'}
					</div>
					<div>
						<span className="font-semibold">Width (mm)</span>{' '}
						{entry.width ?? 'n/a'}
					</div>
					<div>
						<span className="font-semibold">Height (mm)</span>{' '}
						{entry.height ?? 'n/a'}
					</div>
					<div>
						<span className="font-semibold">Weight (kg)</span>{' '}
						{entry.weight ?? 'n/a'}
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
