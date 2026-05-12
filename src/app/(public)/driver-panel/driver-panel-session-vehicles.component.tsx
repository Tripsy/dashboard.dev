import { useCallback } from 'react';
import type { WorkSessionVehicleFormValuesType } from '@/app/(public)/_components/work-session-vehicle/form-manage-work-session-vehicle.component';
import { useWorkSession } from '@/app/(public)/_providers/work-session.provider';
import { Icons } from '@/components/icon.component';
import { Button } from '@/components/ui/button';
import { DisplayStatus } from '@/helpers/display.helper';
import { getCompanyVehicleDisplayName } from '@/models/company-vehicle.model';
import {
	type WorkSessionVehicleModel,
	WorkSessionVehicleStatusEnum,
} from '@/models/work-session-vehicle.model';
import { updateWorkSessionVehicle } from '@/services/work-session-vehicle.service';
import { useModalStore } from '@/stores/window.store';
import type { WindowDefinition } from '@/types/window.type';

export function DriverPanelSessionVehicles({
	sessionVehicles,
}: {
	sessionVehicles: WorkSessionVehicleModel[];
}) {
	const { open } = useModalStore();
	const { refreshSession } = useWorkSession();

	const handleUpdateSessionVehicle = useCallback(
		(entry: WorkSessionVehicleModel) => {
			open({
				minimized: false,
				section: 'public',
				dataSource: 'work-session-vehicle',
				action: 'update',
				data: {
					entries: [entry],
				},
				definition: {
					operationFunction: (
						values: WorkSessionVehicleFormValuesType,
					) => {
						return updateWorkSessionVehicle(
							values,
							entry.id,
							entry.work_session.id,
						);
					},
				} as WindowDefinition<
					WorkSessionVehicleFormValuesType,
					WorkSessionVehicleModel
				>,
				events: {
					success: async () => {
						await refreshSession();
					},
				},
			});
		},
		[open, refreshSession],
	);

	const handleDeleteSessionVehicle = useCallback(
		(entry: WorkSessionVehicleModel) => {
			open({
				minimized: false,
				section: 'public',
				dataSource: 'work-session-vehicle',
				action: 'delete',
				data: {
					entries: [entry],
				},
				events: {
					success: async () => {
						await refreshSession();
					},
				},
			});
		},
		[open, refreshSession],
	);

	const handleStatusReturnSessionVehicle = useCallback(
		(entry: WorkSessionVehicleModel) => {
			open({
				minimized: false,
				section: 'public',
				dataSource: 'work-session-vehicle',
				action: 'return',
				data: {
					entries: [entry],
				},
				definition: {
					operationFunction: (
						values: WorkSessionVehicleFormValuesType,
					) => {
						return updateWorkSessionVehicle(
							values,
							entry.id,
							entry.work_session.id,
						);
					},
				} as WindowDefinition<
					WorkSessionVehicleFormValuesType,
					WorkSessionVehicleModel
				>,
				events: {
					success: async () => {
						await refreshSession();
					},
				},
			});
		},
		[open, refreshSession],
	);

	return (
		<div>
			{sessionVehicles.map((m) => (
				<div
					key={m.id}
					className="bg-card border border-border rounded-lg p-4"
				>
					<div className="flex justify-between items-center">
						<div className="flex flex-col justify-between items-start self-stretch gap-2">
							<h3 className="font-semibold text-card-foreground">
								{getCompanyVehicleDisplayName(
									m.company_vehicle,
								)}
							</h3>
							<div>
								<span className="text-muted-foreground">
									Range Km:
								</span>
								<span className="ml-2 font-mono">
									{m.vehicle_km_start} - {m.vehicle_km_end}
								</span>
							</div>
							<div>
								<DisplayStatus status={m.status} />
							</div>
						</div>

						<div className="flex flex-wrap justify-end gap-4">
							{m.status ===
								WorkSessionVehicleStatusEnum.ASSIGNED && (
								<Button
									variant="secondary"
									hover="warning"
									onClick={() =>
										handleStatusReturnSessionVehicle(m)
									}
									className="cursor-pointer"
								>
									<Icons.Action.Return className="h-4 w-4" />
								</Button>
							)}
							<Button
								variant="secondary"
								hover="info"
								onClick={() => handleUpdateSessionVehicle(m)}
								className="cursor-pointer"
								title="Update vehicle"
							>
								<Icons.Action.Update className="h-4 w-4" />
							</Button>
							<Button
								variant="secondary"
								hover="error"
								onClick={() => handleDeleteSessionVehicle(m)}
								className="cursor-pointer"
								title="Delete vehicle"
							>
								<Icons.Action.Delete className="h-4 w-4" />
							</Button>
						</div>
					</div>
				</div>
			))}
		</div>
	);
}
