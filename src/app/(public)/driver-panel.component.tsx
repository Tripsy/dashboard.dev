'use client';

import { useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useCallback } from 'react';
import { Icons } from '@/components/icon.component';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Routes from '@/config/routes.setup';
import { createCurrentDate, dateDiff, formatDate } from '@/helpers/date.helper';
import { DisplayStatus } from '@/helpers/display.helper';
import { getCompanyVehicleDisplayName } from '@/models/company-vehicle.model';
import type { WorkSessionModel } from '@/models/work-session.model';
import {
	type WorkSessionVehicleModel,
	WorkSessionVehicleStatusEnum,
} from '@/models/work-session-vehicle.model';
import { useWorkSession } from '@/providers/work-session.provider';
import { useModalStore } from '@/stores/window.store';

export function DriverPanelSession({ session }: { session: WorkSessionModel }) {
	const { open } = useModalStore();

	const queryClient = useQueryClient();

	const invalidateWorkSessionVehicle = useCallback(
		() =>
			queryClient.invalidateQueries({
				queryKey: ['work-session-vehicle', session.id],
			}),
		[queryClient, session],
	);

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
					await invalidateWorkSessionVehicle();
				},
			},
		});
	}, [open, session, invalidateWorkSessionVehicle]);

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
					{dateDiff(session.start_at, createCurrentDate(), 'display')}
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
	session,
	sessionVehicles,
}: {
	session: WorkSessionModel;
	sessionVehicles?: WorkSessionVehicleModel[];
}) {
	const { open } = useModalStore();

	const queryClient = useQueryClient();

	const invalidateWorkSessionVehicle = useCallback(
		() =>
			queryClient.invalidateQueries({
				queryKey: ['work-session-vehicle', session.id],
			}),
		[queryClient, session],
	);

	const onUpdate = useCallback(
		(entry: WorkSessionVehicleModel) => {
			open({
				minimized: false,
				section: 'public',
				dataSource: 'work-session-vehicle',
				action: 'update',
				data: {
					entries: [entry],
				},
				events: {
					success: async () => {
						await invalidateWorkSessionVehicle();
					},
				},
			});
		},
		[open, invalidateWorkSessionVehicle],
	);

	const onDelete = useCallback(
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
						await invalidateWorkSessionVehicle();
					},
				},
			});
		},
		[open, invalidateWorkSessionVehicle],
	);

	const onStatusReturn = useCallback(
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
						await invalidateWorkSessionVehicle();
					},
				},
			});
		},
		[open, invalidateWorkSessionVehicle],
	);

	return (
		<div>
			{sessionVehicles?.map((m) => (
				<div
					key={m.id}
					className="bg-card border border-border rounded-lg p-4 mb-3"
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
										onClick={() => onStatusReturn(m)}
										className="cursor-pointer text-primary hover:text-primary-hover transition-colors"
										title="Mark as returned"
									>
										<Icons.Action.Return className="h-4 w-4" />
									</button>
								)}
								<button
									type="button"
									onClick={() => onUpdate(m)}
									className="cursor-pointer text-primary hover:text-primary-hover transition-colors"
									title="Update vehicle"
								>
									<Icons.Action.Update className="h-4 w-4" />
								</button>
								<button
									type="button"
									onClick={() => onDelete(m)}
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
	const { activeSession, recentSessions } = useWorkSession();

	// const { open } = useModalStore();
	//
	// const queryClient = useQueryClient();
	//
	// const invalidateWorkSessionVehicle = useCallback(
	// 	() =>
	// 		queryClient.invalidateQueries({
	// 			queryKey: ['work-session-vehicle', activeSession.id],
	// 		}),
	// 	[queryClient, activeSession],
	// );
	//
	// const openCreate = useCallback(() => {
	// 	open({
	// 		minimized: false,
	// 		section: 'public',
	// 		dataSource: 'work-session-vehicle',
	// 		action: 'create',
	// 		data: {
	// 			prefillEntry: {
	// 				work_session: activeSession,
	// 			},
	// 		},
	// 		events: {
	// 			success: async () => {
	// 				await invalidateWorkSessionVehicle();
	// 			},
	// 		},
	// 	});
	// }, [
	// 	open,
	// 	activeSession,
	// 	invalidateWorkSessionVehicle,
	// ]);

	return (
		<section className="py-12 md:py-20">
			<div className="container-default">
				<div className="max-w-3xl mx-auto text-center">
					{activeSession ? (
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
									<DriverPanelSessionVehicles
										session={activeSession}
										sessionVehicles={
											activeSession.work_session_vehicle
										}
									/>
								</TabsContent>
							</Tabs>
						</div>
					) : (
						<div>
							<p className="mb-4">
								There is no work session active at the moment!
							</p>
							<Button
								size="lg"
								className="h-12 px-8 text-base max-w-48"
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
