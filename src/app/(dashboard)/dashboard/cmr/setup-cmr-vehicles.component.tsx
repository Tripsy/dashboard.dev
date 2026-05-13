'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { Icons } from '@/components/icon.component';
import {
	ErrorComponent,
	LoadingComponent,
} from '@/components/status.component';
import { Button } from '@/components/ui/button';
import { requestFind } from '@/helpers/services.helper';
import type { CmrModel } from '@/models/cmr.model';
import type { CmrVehicleModel } from '@/models/cmr-vehicle.model';
import { displayVehicleLabel, VehicleTypeEnum } from '@/models/vehicle.model';
import { useModalStore } from '@/stores/window.store';
import { DataSourceSectionEnum } from '@/types/data-source.type';
import type { WindowEntryType } from '@/types/window.type';

export function SetupCmrVehicles({ entries }: { entries: WindowEntryType[] }) {
	const { open, focus, getCurrentWindow } = useModalStore();

	const windowConfig = getCurrentWindow();

	const queryClient = useQueryClient();

	const cmrModel = entries[0] as CmrModel | undefined;
	const cmrId = cmrModel?.id;

	const {
		data: cmrVehicle,
		isLoading: isLoadingCmrVehicle,
		error: errorCmrVehicle,
	} = useQuery({
		queryKey: ['cmr-vehicle', cmrModel?.id],
		queryFn: () =>
			requestFind<CmrVehicleModel>('cmr-vehicle', {
				filter: {
					cmr_id: cmrId as number,
				},
			}),
		enabled: !!cmrId,
	});

	const invalidateCmrVehicle = useCallback(
		() =>
			queryClient.invalidateQueries({
				queryKey: ['cmr-vehicle', cmrModel?.id],
			}),
		[queryClient, cmrModel?.id],
	);

	const openCreate = useCallback(() => {
		open({
			minimized: false,
			section: DataSourceSectionEnum.DASHBOARD,
			dataSource: 'cmr-vehicle',
			action: 'create',
			data: {
				prefillEntry: {
					cmr: cmrModel,
				},
			},
			events: {
				success: async () => {
					await invalidateCmrVehicle();

					// Back to `setup-cmr-vehicle`
					if (windowConfig) {
						focus(windowConfig.uid);
					}
				},
				close: async () => {
					// Back to `setup-cmr-vehicle`
					if (windowConfig) {
						focus(windowConfig.uid);
					}
				},
			},
		});
	}, [open, cmrModel, invalidateCmrVehicle, focus, windowConfig]);

	const onUpdate = useCallback(
		(entry: CmrVehicleModel) => {
			open({
				minimized: false,
				section: DataSourceSectionEnum.DASHBOARD,
				dataSource: 'cmr-vehicle',
				action: 'update',
				data: {
					entries: [entry],
				},
				events: {
					success: async () => {
						await invalidateCmrVehicle();

						// Back to `setup-cmr-vehicle`
						if (windowConfig) {
							focus(windowConfig.uid);
						}
					},
					close: async () => {
						// Back to `setup-cmr-vehicle`
						if (windowConfig) {
							focus(windowConfig.uid);
						}
					},
				},
			});
		},
		[open, invalidateCmrVehicle, focus, windowConfig],
	);

	const onDelete = useCallback(
		(entry: CmrVehicleModel) => {
			open({
				minimized: false,
				section: DataSourceSectionEnum.DASHBOARD,
				dataSource: 'cmr-vehicle',
				action: 'delete',
				data: {
					entries: [entry],
				},
				events: {
					success: async () => {
						await invalidateCmrVehicle();
					},
					close: async () => {
						// Back to `setup-cmr-vehicle`
						if (windowConfig) {
							focus(windowConfig.uid);
						}
					},
				},
			});
		},
		[open, invalidateCmrVehicle, focus, windowConfig],
	);

	if (!cmrModel) {
		return <ErrorComponent />;
	}

	if (errorCmrVehicle) {
		return <ErrorComponent description={errorCmrVehicle.message} />;
	}

	if (isLoadingCmrVehicle) {
		return <LoadingComponent />;
	}

	return (
		<div>
			{(cmrVehicle?.entries?.length ?? 0) > 0 ? (
				<div className="overflow-x-auto rounded-lg border border-border shadow-sm">
					<table className="min-w-full divide-y divide-border">
						<thead className="bg-muted">
							<tr>
								<th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
									Vehicle
								</th>
								<th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
									Status
								</th>
								<th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
									Range (Km)
								</th>
								<th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
									Actions
								</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-border bg-card">
							{cmrVehicle?.entries.map((v) => (
								<CmrVehicleEntry
									key={v.id}
									m={v}
									onUpdate={onUpdate}
									onDelete={onDelete}
								/>
							))}
						</tbody>
					</table>
				</div>
			) : (
				<div className="text-center py-8 px-4 bg-muted rounded-lg border border-border">
					<Icons.Vehicle className="mx-auto h-12 w-12 text-muted-foreground" />
					<p className="mt-2 text-sm text-muted-foreground">
						No vehicles set
					</p>
				</div>
			)}

			<div className="mt-4">
				<Button
					type="button"
					variant="success"
					onClick={openCreate}
					title="Add vehicle"
					className="inline-flex items-center gap-2"
				>
					<Icons.Vehicle /> Add vehicle
				</Button>
			</div>
		</div>
	);
}

type CmrVehicleEntryProps = {
	m: CmrVehicleModel;
	onUpdate: (entry: CmrVehicleModel) => void;
	onDelete: (entry: CmrVehicleModel) => void;
};

function CmrVehicleEntry({ m, onUpdate, onDelete }: CmrVehicleEntryProps) {
	return (
		<tr className="hover:bg-muted/50 transition-colors duration-150">
			<td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-card-foreground">
				{displayVehicleLabel(m.vehicle)}
			</td>
			<td className="px-4 py-4 whitespace-nowrap text-sm text-card-foreground">
				{m.company_vehicle.vehicle.vehicle_type ===
				VehicleTypeEnum.TRAILER ? (
					<span className="mx-1 text-muted-foreground italic">
						n/a
					</span>
				) : (
					<div>
						<span className="font-mono">
							{m.vehicle_km_start || '-'}
						</span>
						<span className="mx-1 text-muted-foreground">→</span>
						<span className="font-mono">
							{m.vehicle_km_end || '-'}
						</span>
					</div>
				)}
			</td>
			<td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
				<div className="flex gap-3 items-center justify-end">
					<button
						type="button"
						onClick={() => onUpdate(m)}
						className="cursor-pointer text-primary hover:text-primary-hover transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded focus:ring-offset-background"
						title="Update vehicle"
					>
						<Icons.Action.Update className="h-4 w-4" />
					</button>
					<span className="text-border">/</span>
					<button
						type="button"
						onClick={() => onDelete(m)}
						className="cursor-pointer text-destructive hover:text-destructive/80 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-destructive focus:ring-offset-2 rounded focus:ring-offset-background"
						title="Delete vehicle"
					>
						<Icons.Action.Delete className="h-4 w-4" />
					</button>
				</div>
			</td>
		</tr>
	);
}
