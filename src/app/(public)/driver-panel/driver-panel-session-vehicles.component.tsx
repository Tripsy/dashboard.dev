import { useCallback, useState } from 'react';
import type { WorkSessionVehicleFormValuesType } from '@/app/(public)/_components/work-session-vehicle/form-manage-work-session-vehicle.component';
import { useWorkSession } from '@/app/(public)/_providers/work-session.provider';
import { Icons } from '@/components/icon.component';
import { Button } from '@/components/ui/button';
import { DisplayStatus } from '@/helpers/display.helper';
import {
	CashFlowCategoryEnum,
	CashFlowMethodEnum,
	OperationalRecordTypeEnum,
} from '@/models/cash-flow.model';
import { displayCompanyVehicleLabel } from '@/models/company-vehicle.model';
import { VehicleTypeEnum } from '@/models/vehicle.model';
import {
	type WorkSessionVehicleModel,
	WorkSessionVehicleStatusEnum,
} from '@/models/work-session-vehicle.model';
import { updateWorkSessionVehicle } from '@/services/work-session-vehicle.service';
import { useModalStore } from '@/stores/window.store';
import { DataSourceSectionEnum } from '@/types/data-source.type';

const STATUS_ORDER: Record<string, number> = {
	assigned: 0,
	returned: 1,
};

export function DriverPanelSessionVehicles({
	sessionVehicles,
}: {
	sessionVehicles: WorkSessionVehicleModel[];
}) {
	const { open } = useModalStore();
	const { setActiveTab, refreshSession, refetchSessionCashFlowEntries } =
		useWorkSession();

	const [withReturned, setWithReturned] = useState(false);

	const handleUpdateSessionVehicle = useCallback(
		(entry: WorkSessionVehicleModel) => {
			open({
				minimized: false,
				section: DataSourceSectionEnum.PUBLIC,
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

	const handleDeleteSessionVehicle = useCallback(
		(entry: WorkSessionVehicleModel) => {
			open({
				minimized: false,
				section: DataSourceSectionEnum.PUBLIC,
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
				section: DataSourceSectionEnum.PUBLIC,
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

	const handleCreatePaymentFuel = useCallback(
		(entry: WorkSessionVehicleModel) => {
			open({
				minimized: false,
				section: DataSourceSectionEnum.PUBLIC,
				dataSource: 'cash-flow',
				action: 'create',
				data: {
					prefillEntry: {
						category: CashFlowCategoryEnum.FUEL,
						method: CashFlowMethodEnum.CREDIT_CARD,
						operational_records: {
							[OperationalRecordTypeEnum.EMPLOYEE]:
								entry.work_session.user,
							[OperationalRecordTypeEnum.COMPANY_VEHICLE]:
								entry.company_vehicle,
						},
					},
				},
				events: {
					success: async () => {
						await refetchSessionCashFlowEntries();

						setActiveTab('sessionCashFlowEntries');
					},
				},
			});
		},
		[open, refetchSessionCashFlowEntries, setActiveTab],
	);

	const handleCreatePaymentToll = useCallback(
		(entry: WorkSessionVehicleModel) => {
			open({
				minimized: false,
				section: DataSourceSectionEnum.PUBLIC,
				dataSource: 'cash-flow',
				action: 'create',
				data: {
					prefillEntry: {
						category: CashFlowCategoryEnum.TOLLS,
						operational_records: {
							[OperationalRecordTypeEnum.EMPLOYEE]:
								entry.work_session.user,
							[OperationalRecordTypeEnum.COMPANY_VEHICLE]:
								entry.company_vehicle,
						},
					},
				},
				events: {
					success: async () => {
						await refetchSessionCashFlowEntries();

						setActiveTab('sessionCashFlowEntries');
					},
				},
			});
		},
		[open, refetchSessionCashFlowEntries, setActiveTab],
	);

	const hasReturnedVehicles = sessionVehicles.some(
		(m) => m.status === WorkSessionVehicleStatusEnum.RETURNED,
	);

	const sessionVehiclesSorted = withReturned
		? [...sessionVehicles].sort(
				(a, b) =>
					(STATUS_ORDER[a.status] ?? 99) -
					(STATUS_ORDER[b.status] ?? 99),
			)
		: sessionVehicles;

	return (
		<>
			<div className="space-y-4">
				{sessionVehiclesSorted
					.filter(
						(m) =>
							withReturned ||
							m.status !== WorkSessionVehicleStatusEnum.RETURNED,
					)
					.map((m) => (
						<div
							key={m.id}
							className="bg-card border border-border rounded-lg p-4"
						>
							<div className="flex justify-between items-center">
								<div className="flex flex-col justify-between items-start self-stretch gap-2">
									<h3 className="font-semibold text-card-foreground">
										{displayCompanyVehicleLabel(
											m.company_vehicle,
										)}
									</h3>
									<div>
										<span className="text-muted-foreground">
											Range Km:
										</span>
										<span className="ml-2 font-mono">
											{m.vehicle_km_start} -{' '}
											{m.vehicle_km_end}
										</span>
									</div>
									<div>
										<DisplayStatus
											status={m.status}
											dataSource="work-session-vehicle"
										/>
									</div>
								</div>
								<div className="flex gap-x-4">
									{m.status ===
										WorkSessionVehicleStatusEnum.ASSIGNED &&
										m.company_vehicle.vehicle
											.vehicle_type ===
											VehicleTypeEnum.AUTO && (
											<div className="flex flex-col justify-start gap-4">
												<Button
													variant="default"
													hover="success"
													onClick={() =>
														handleCreatePaymentFuel(
															m,
														)
													}
													className="cursor-pointer"
													title="Add fuel payment"
												>
													<Icons.Fuel className="h-4 w-4" />{' '}
													Fuel
												</Button>

												<Button
													variant="default"
													hover="success"
													onClick={() =>
														handleCreatePaymentToll(
															m,
														)
													}
													className="cursor-pointer"
													title="Add toll payment"
												>
													<Icons.Toll className="h-4 w-4" />{' '}
													Toll
												</Button>
											</div>
										)}

									<div className="flex flex-col justify-start gap-4">
										{m.status ===
											WorkSessionVehicleStatusEnum.ASSIGNED && (
											<Button
												variant="secondary"
												hover="warning"
												onClick={() =>
													handleStatusReturnSessionVehicle(
														m,
													)
												}
												className="cursor-pointer"
												title="Return vehicle"
											>
												<Icons.Action.Return className="h-4 w-4" />
											</Button>
										)}
										<Button
											variant="secondary"
											hover="info"
											onClick={() =>
												handleUpdateSessionVehicle(m)
											}
											className="cursor-pointer"
											title="Update vehicle"
										>
											<Icons.Action.Update className="h-4 w-4" />
										</Button>
										<Button
											variant="secondary"
											hover="error"
											onClick={() =>
												handleDeleteSessionVehicle(m)
											}
											className="cursor-pointer"
											title="Delete vehicle"
										>
											<Icons.Action.Delete className="h-4 w-4" />
										</Button>
									</div>
								</div>
							</div>
						</div>
					))}
			</div>
			<div className="mt-4 flex justify-end">
				{hasReturnedVehicles &&
					(withReturned ? (
						<Button
							variant="ghost"
							onClick={() => setWithReturned(false)}
							title="Hide returned vehicles"
						>
							<Icons.Obscured className="h-4 w-4" /> Hide returned
						</Button>
					) : (
						<Button
							variant="ghost"
							onClick={() => setWithReturned(true)}
							title="Show returned vehicles"
						>
							<Icons.Visible className="h-4 w-4" /> Show returned
						</Button>
					))}
			</div>
		</>
	);
}
