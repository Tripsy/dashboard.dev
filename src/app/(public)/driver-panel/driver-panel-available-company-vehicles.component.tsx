import { useCallback } from 'react';
import type { WorkSessionVehicleFormValuesType } from '@/app/(public)/_components/work-session-vehicle/form-manage-work-session-vehicle.component';
import { useWorkSession } from '@/app/(public)/_providers/work-session.provider';
import { Icons } from '@/components/icon.component';
import { Button } from '@/components/ui/button';
import type { CompanyVehicleModel } from '@/models/company-vehicle.model';
import type { WorkSessionModel } from '@/models/work-session.model';
import type { WorkSessionVehicleModel } from '@/models/work-session-vehicle.model';
import { createWorkSessionVehicle } from '@/services/work-session-vehicle.service';
import { useModalStore } from '@/stores/window.store';
import type { WindowDefinition } from '@/types/window.type';

export function DriverPanelAvailableCompanyVehicles({
	activeSession,
	availableCompanyVehicles,
}: {
	activeSession: WorkSessionModel;
	availableCompanyVehicles: CompanyVehicleModel[];
}) {
	const { open } = useModalStore();
	const { refreshSession } = useWorkSession();

	const handlePickSessionVehicle = useCallback(
		(entry: CompanyVehicleModel, workSession: WorkSessionModel) => {
			open({
				minimized: false,
				section: 'public',
				dataSource: 'work-session-vehicle',
				action: 'create',
				data: {
					prefillEntry: {
						company_vehicle: entry,
					},
				},
				definition: {
					operationFunction: (
						values: WorkSessionVehicleFormValuesType,
					) => {
						return createWorkSessionVehicle(values, workSession.id);
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
			{availableCompanyVehicles.map((m) => (
				<div
					key={m.id}
					className="bg-card border border-border rounded-lg p-4 mb-4"
				>
					<div className="flex justify-between">
						<div className="flex flex-col justify-between items-start self-stretch">
							<h3 className="font-semibold text-card-foreground">
								{m.vehicle?.brand?.name} {m.vehicle.model}
							</h3>
							<div>
								<span className="text-muted-foreground">
									{m.license_plate}
								</span>
							</div>
						</div>

						<div className="flex flex-col items-end gap-2">
							<Button
								variant="success"
								onClick={() =>
									handlePickSessionVehicle(m, activeSession)
								}
								className="cursor-pointer"
								title="Pick vehicle"
							>
								<Icons.Action.Add className="h-4 w-4" /> Pick
							</Button>
						</div>
					</div>
				</div>
			))}
		</div>
	);
}
