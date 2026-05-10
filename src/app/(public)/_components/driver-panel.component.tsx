'use client';

import { useCallback } from 'react';
import {
	prepareParamsFromFormValues,
	type WorkSessionCreateOutput,
} from '@/app/(public)/_components/work-session/work-session.definition';
import type { WorkSessionVehicleFormValuesType } from '@/app/(public)/_components/work-session-vehicle/form-manage-work-session-vehicle.component';
import { useWorkSession } from '@/app/(public)/_providers/work-session.provider';
import { Icons } from '@/components/icon.component';
import {
	ErrorComponent,
	LoadingComponent,
} from '@/components/status.component';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { createCurrentDate, formatDate } from '@/helpers/date.helper';
import { DisplayStatus } from '@/helpers/display.helper';
import { requestCreate } from '@/helpers/services.helper';
import { getCompanyVehicleDisplayName } from '@/models/company-vehicle.model';
import {
	displayWorkSessionDuration,
	type WorkSessionModel,
} from '@/models/work-session.model';
import {
	type WorkSessionVehicleModel,
	WorkSessionVehicleStatusEnum,
} from '@/models/work-session-vehicle.model';
import { useAuth } from '@/providers/auth.provider';
import {
	createWorkSessionVehicle,
	updateWorkSessionVehicle,
} from '@/services/work-session-vehicle.service';
import { useModalStore } from '@/stores/window.store';
import type { WindowDefinition } from '@/types/window.type';

export function DriverPanelSession({ session }: { session: WorkSessionModel }) {
	const { open } = useModalStore();
	const { refreshSession } = useWorkSession();

	const handleCloseSession = useCallback(() => {
		open({
			minimized: false,
			section: 'public',
			dataSource: 'work-session',
			action: 'close',
			data: {
				entries: [session],
			},
			events: {
				success: async () => {
					await refreshSession();
				},
			},
		});
	}, [open, session, refreshSession]);

	return (
		<div className="flex flex-col md:flex-row gap-y-1 font-medium text-muted-foreground bg-card md:border border-r-0 border-border shadow-lg">
			<div className="flex flex-1">
				<div className="bg-muted px-4 py-3 text-xs uppercase tracking-wider w-32 whitespace-nowrap">
					Started at:
				</div>
				<div className="px-4 py-3 text-sm whitespace-nowrap flex items-center">
					<Icons.Calendar className="mr-2 h-4 w-4" />
					{formatDate(session.start_at, undefined, {
						customFormat: 'd MMMM, hh:mm',
					})}
				</div>
			</div>

			<div className="flex flex-1">
				<div className="bg-muted px-4 py-3 text-xs uppercase tracking-wider w-32 whitespace-nowrap">
					Duration:
				</div>
				<div className="px-4 py-3 text-sm whitespace-nowrap flex items-center">
					<Icons.Clock className="mr-2 h-4 w-4" />
					{displayWorkSessionDuration(session)}
				</div>
			</div>

			<div className="flex-1 flex justify-end min-w-48">
				<Button
					size="md"
					className="h-full w-full md:w-auto px-8 text-base font-bold text-background/90 rounded-none"
					variant="error"
					onClick={handleCloseSession}
				>
					Close session
					<Icons.Action.Close className="ml-2 h-5 w-5" />
				</Button>
			</div>
		</div>
	);
}

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
					operationFunction: (values: WorkSessionVehicleFormValuesType) => {
						return updateWorkSessionVehicle(
							values,
							entry.id,
							entry.work_session.id,
						);
					},
				} as WindowDefinition<WorkSessionVehicleFormValuesType, WorkSessionVehicleModel>,
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
					<div className="flex justify-between">
						<div className="flex flex-col justify-between items-start self-stretch">
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
						</div>

						<div className="flex flex-col items-end gap-2">
							<div className="flex gap-4">
								{m.status ===
									WorkSessionVehicleStatusEnum.ASSIGNED && (
									<button
										type="button"
										onClick={() =>
											handleStatusReturnSessionVehicle(m)
										}
										className="cursor-pointer text-primary hover:text-primary-hover transition-colors"
										title="Mark as returned"
									>
										<Icons.Action.Return className="h-4 w-4" />
									</button>
								)}
								<button
									type="button"
									onClick={() =>
										handleUpdateSessionVehicle(m)
									}
									className="cursor-pointer text-primary hover:text-primary-hover transition-colors"
									title="Update vehicle"
								>
									<Icons.Action.Update className="h-4 w-4" />
								</button>
								<button
									type="button"
									onClick={() =>
										handleDeleteSessionVehicle(m)
									}
									className="cursor-pointer text-destructive hover:text-destructive/80 transition-colors"
									title="Delete vehicle"
								>
									<Icons.Action.Delete className="h-4 w-4" />
								</button>
							</div>
							<div className="mt-1">
								<DisplayStatus status={m.status} />
							</div>
						</div>
					</div>
				</div>
			))}
		</div>
	);
}

export function DriverPanel() {
	const {
		sessionSituation,
		activeSession,
		activeSessionVehicles,
		refreshSession,
	} = useWorkSession();
	const { auth } = useAuth();
	const { open } = useModalStore();

	const handleStartSession = useCallback(() => {
		if (!auth) {
			throw new Error('Not authenticated');
		}

		open({
			minimized: false,
			section: 'public',
			dataSource: 'work-session',
			action: 'create',
			data: {
				prefillEntry: {
					start_at: createCurrentDate(),
				},
			},
			definition: {
				operationFunction: (values: WorkSessionCreateOutput) => {
					const params = prepareParamsFromFormValues(auth, values);

					return requestCreate<WorkSessionModel, typeof params>(
						'work-session',
						params,
					);
				},
			} as WindowDefinition<WorkSessionCreateOutput, WorkSessionModel>,
			events: {
				success: async () => {
					await refreshSession();
				},
			},
		});
	}, [open, refreshSession, auth]);

	const handleCreateSessionVehicle = useCallback(
		(session: WorkSessionModel) => {
			open({
				minimized: false,
				section: 'public',
				dataSource: 'work-session-vehicle',
				action: 'create',
				definition: {
					operationFunction: (
						params: WorkSessionVehicleFormValuesType,
					) => {
						return createWorkSessionVehicle(params, session.id);
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

	switch (sessionSituation) {
		case 'loading':
			return <LoadingComponent />;
		case 'error':
			return <ErrorComponent />;
	}

	return (
		<section className="py-12 md:py-20">
			<div className="container-default">
				<div className="max-w-3xl mx-auto text-center">
					{sessionSituation === 'active' && activeSession ? (
						<div className="space-y-8">
							<DriverPanelSession session={activeSession} />

							<Tabs
								defaultValue="sessionVehicles"
								className="w-full"
							>
								<TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 p-0 mb-4">
									<TabsTrigger
										value="sessionVehicles"
										className=""
									>
										Session Vehicles
									</TabsTrigger>
									<TabsTrigger value="sessionCmrs">
										Session CMRs
									</TabsTrigger>
									<TabsTrigger value="payments">
										Payments
									</TabsTrigger>
									<TabsTrigger value="expenses">
										Expenses
									</TabsTrigger>
								</TabsList>
								<TabsContent value="sessionVehicles">
									{activeSessionVehicles.length > 0 ? (
										<DriverPanelSessionVehicles
											sessionVehicles={
												activeSessionVehicles
											}
										/>
									) : (
										<div className="text-center py-8 px-4 bg-muted rounded-lg border border-border">
											<Icons.Vehicle className="mx-auto h-12 w-12 text-muted-foreground" />
											<p className="mt-2 text-sm text-muted-foreground">
												There are no vehicles assigned
												to current session
											</p>
										</div>
									)}
									<Button
										variant="success"
										className="mt-4"
										onClick={() =>
											handleCreateSessionVehicle(
												activeSession,
											)
										}
										title="Add vehicle"
									>
										<Icons.Action.Create className="h-4 w-4" />{' '}
										Add vehicle
									</Button>
								</TabsContent>
							</Tabs>
						</div>
					) : (
						<div>
							<div className="text-center py-8 px-4 bg-muted rounded-lg border border-border">
								<Icons.WorkSession className="mx-auto h-12 w-12 text-muted-foreground" />
								<p className="mt-2 text-sm text-muted-foreground">
									There is no work session active at the moment!
								</p>
							</div>
							<Button
								className="mt-4 max-w-48"
								onClick={handleStartSession}
								title="Start session"
							>
								Start session
								<Icons.Clock className="ml-2 h-5 w-5" />
							</Button>
						</div>
					)}
				</div>
			</div>
		</section>
	);
}
