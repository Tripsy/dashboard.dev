'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { Icons } from '@/components/icon.component';
import {
	ErrorComponent,
	LoadingComponent,
} from '@/components/status.component';
import { Button } from '@/components/ui/button';
import { DisplayStatus } from '@/helpers/display.helper';
import { requestFind } from '@/helpers/services.helper';
import { getCompanyVehicleDisplayName } from '@/models/company-vehicle.model';
import type { WorkSessionModel } from '@/models/work-session.model';
import {
	type WorkSessionVehicleModel,
	WorkSessionVehicleStatusEnum,
} from '@/models/work-session-vehicle.model';
import { useModalStore } from '@/stores/window.store';
import type { WindowEntryType } from '@/types/window.type';

export function SetupWorkSessionVehicles({
	entries,
}: {
	entries: WindowEntryType[];
}) {
	const { open, focus, getCurrentWindow } = useModalStore();

	const windowConfig = getCurrentWindow();

	const queryClient = useQueryClient();
	const queryKeyLabel = 'work-session-vehicles';

	const workSessionModel = entries[0] as WorkSessionModel | undefined;
	const workSessionId = workSessionModel?.id;

	const {
		data: workSessionVehicles,
		isLoading: isLoadingWorkSessionVehicles,
		error: errorWorkSessionVehicles,
	} = useQuery({
		queryKey: [queryKeyLabel, workSessionModel?.id],
		queryFn: () =>
			requestFind<WorkSessionVehicleModel>('work-session-vehicles', {
				filter: {
					work_session_id: workSessionId as number,
				},
			}),
		enabled: !!workSessionId,
	});

	const invalidateWorkSessionVehicles = useCallback(
		() =>
			queryClient.invalidateQueries({
				queryKey: [queryKeyLabel, workSessionModel?.id],
			}),
		[queryClient, workSessionModel?.id],
	);

	const openCreate = useCallback(() => {
		open({
			minimized: false,
			section: 'dashboard',
			dataSource: 'work-session-vehicles',
			action: 'create',
			data: {
				prefillEntry: {
					work_session: workSessionModel,
				},
			},
			events: {
				success: async () => {
					await invalidateWorkSessionVehicles();

					// Back to `setup-work-session-vehicle`
					if (windowConfig) {
						focus(windowConfig.uid);
					}
				},
				close: async () => {
					// Back to `setup-work-session-vehicle`
					if (windowConfig) {
						focus(windowConfig.uid);
					}
				},
			},
		});
	}, [
		open,
		workSessionModel,
		invalidateWorkSessionVehicles,
		focus,
		windowConfig,
	]);

	const onUpdate = useCallback(
		(entry: WorkSessionVehicleModel) => {
			open({
				minimized: false,
				section: 'dashboard',
				dataSource: 'work-session-vehicles',
				action: 'update',
				data: {
					entries: [entry],
				},
				events: {
					success: async () => {
						await invalidateWorkSessionVehicles();

						// Back to `setup-work-session-vehicle`
						if (windowConfig) {
							focus(windowConfig.uid);
						}
					},
					close: async () => {
						// Back to `setup-work-session-vehicle`
						if (windowConfig) {
							focus(windowConfig.uid);
						}
					},
				},
			});
		},
		[open, invalidateWorkSessionVehicles, focus, windowConfig],
	);

	const onDelete = useCallback(
		(entry: WorkSessionVehicleModel) => {
			open({
				minimized: false,
				section: 'dashboard',
				dataSource: 'work-session-vehicles',
				action: 'delete',
				data: {
					entries: [entry],
				},
				events: {
					success: async () => {
						await invalidateWorkSessionVehicles();
					},
					close: async () => {
						// Back to `setup-work-session-vehicle`
						if (windowConfig) {
							focus(windowConfig.uid);
						}
					},
				},
			});
		},
		[open, invalidateWorkSessionVehicles, focus, windowConfig],
	);

	const onStatusReturn = useCallback(
		(entry: WorkSessionVehicleModel) => {
			open({
				minimized: false,
				section: 'dashboard',
				dataSource: 'work-session-vehicles',
				action: 'return',
				data: {
					entries: [entry],
				},
				events: {
					success: async () => {
						await invalidateWorkSessionVehicles();
					},
					close: async () => {
						// Back to `setup-work-session-vehicle`
						if (windowConfig) {
							focus(windowConfig.uid);
						}
					},
				},
			});
		},
		[open, invalidateWorkSessionVehicles, focus, windowConfig],
	);

	if (!workSessionModel) {
		return <ErrorComponent />;
	}

	if (errorWorkSessionVehicles) {
		return (
			<ErrorComponent description={errorWorkSessionVehicles.message} />
		);
	}

	if (isLoadingWorkSessionVehicles) {
		return <LoadingComponent />;
	}

	return (
		<div>
			{(workSessionVehicles?.entries?.length ?? 0) > 0 ? (
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
							{workSessionVehicles?.entries.map((v) => (
								<WorkSessionVehicleEntry
									key={v.id}
									m={v}
									onUpdate={onUpdate}
									onDelete={onDelete}
									onStatusReturn={onStatusReturn}
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

type WorkSessionVehicleEntryProps = {
	m: WorkSessionVehicleModel;
	onUpdate: (entry: WorkSessionVehicleModel) => void;
	onDelete: (entry: WorkSessionVehicleModel) => void;
	onStatusReturn: (entry: WorkSessionVehicleModel) => void;
};

function WorkSessionVehicleEntry({
	m,
	onUpdate,
	onDelete,
	onStatusReturn,
}: WorkSessionVehicleEntryProps) {
	return (
		<tr className="hover:bg-muted/50 transition-colors duration-150">
			<td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-card-foreground">
				{getCompanyVehicleDisplayName(m.company_vehicle)}
			</td>
			<td className="px-4 py-4 whitespace-nowrap">
				{m.status === WorkSessionVehicleStatusEnum.ASSIGNED ? (
					<button
						type="button"
						onClick={() => onStatusReturn(m)}
						title="Mark as returned"
						className="cursor-pointer"
					>
						<DisplayStatus status={m.status} />
					</button>
				) : (
					<DisplayStatus status={m.status} />
				)}
			</td>
			<td className="px-4 py-4 whitespace-nowrap text-sm text-card-foreground">
				<span className="font-mono">{m.vehicle_km_start || '-'}</span>
				<span className="mx-1 text-muted-foreground">→</span>
				<span className="font-mono">{m.vehicle_km_end || '-'}</span>
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
