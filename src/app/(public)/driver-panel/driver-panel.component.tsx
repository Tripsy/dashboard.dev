'use client';

import { useCallback, useState } from 'react';
import {
	prepareParamsFromFormValues,
	type WorkSessionCreateOutput,
} from '@/app/(public)/_components/work-session/work-session.definition';
import type { WorkSessionVehicleFormValuesType } from '@/app/(public)/_components/work-session-vehicle/form-manage-work-session-vehicle.component';
import { useWorkSession } from '@/app/(public)/_providers/work-session.provider';
import { DriverPanelAvailableCompanyVehicles } from '@/app/(public)/driver-panel/driver-panel-available-company-vehicles.component';
import { DriverPanelSession } from '@/app/(public)/driver-panel/driver-panel-session.component';
import { DriverPanelSessionCmrs } from '@/app/(public)/driver-panel/driver-panel-session-cmrs.component';
import { DriverPanelSessionVehicles } from '@/app/(public)/driver-panel/driver-panel-session-vehicles.component';
import { Icons } from '@/components/icon.component';
import {
	ErrorComponent,
	LoadingComponent,
} from '@/components/status.component';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { createCurrentDate } from '@/helpers/date.helper';
import { requestCreate } from '@/helpers/services.helper';
import type { CmrModel } from '@/models/cmr.model';
import type { WorkSessionModel } from '@/models/work-session.model';
import type { WorkSessionVehicleModel } from '@/models/work-session-vehicle.model';
import { useAuth } from '@/providers/auth.provider';
import { createCmrSession } from '@/services/cmr-session.service';
import { createWorkSessionVehicle } from '@/services/work-session-vehicle.service';
import { useModalStore } from '@/stores/window.store';
import { DataSourceSectionEnum } from '@/types/data-source.type';
import type { WindowDefinition } from '@/types/window.type';

export function DriverPanel() {
	const {
		sessionSituation,
		activeSession,
		activeSessionVehicles,
		availableCompanyVehicles,
		workSessionCmrs,
		refreshSession,
	} = useWorkSession();
	const { auth } = useAuth();
	const { open } = useModalStore();

	const [activeTab, setActiveTab] = useState('sessionVehicles');

	const handleStartSession = useCallback(() => {
		if (!auth) {
			throw new Error('Not authenticated');
		}

		open({
			minimized: false,
			section: DataSourceSectionEnum.PUBLIC,
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
				section: DataSourceSectionEnum.PUBLIC,
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

	const handleCreateCmr = useCallback(
		(session: WorkSessionModel) => {
			open({
				minimized: false,
				section: DataSourceSectionEnum.PUBLIC,
				dataSource: 'cmr',
				action: 'create',
				events: {
					success: async (cmr?: CmrModel) => {
						if (!cmr) {
							return;
						}

						await createCmrSession(
							{
								work_session_id: session.id,
							},
							cmr.id,
						);

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
				<div className="max-w-3xl mx-auto">
					{sessionSituation === 'active' && activeSession ? (
						<div className="space-y-8">
							<DriverPanelSession session={activeSession} />

							<Tabs
								value={activeTab}
								onValueChange={setActiveTab}
								className="w-full"
							>
								<TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 p-0 mb-4">
									<TabsTrigger value="sessionVehicles">
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
									<div className="flex justify-center my-4">
										<Button
											variant="success"
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
									</div>
									{availableCompanyVehicles.length > 0 && (
										<div>
											<div className="mb-4 inline-flex whitespace-nowrap rounded-sm p-2 transition-all shadow-sm">
												Available Vehicles
											</div>
											<DriverPanelAvailableCompanyVehicles
												activeSession={activeSession}
												availableCompanyVehicles={
													availableCompanyVehicles
												}
											/>
										</div>
									)}
								</TabsContent>

								<TabsContent value="sessionCmrs">
									{workSessionCmrs.length > 0 ? (
										<DriverPanelSessionCmrs
											sessionCmrs={workSessionCmrs}
										/>
									) : (
										<div className="text-center py-8 px-4 bg-muted rounded-lg border border-border">
											<Icons.Cmr className="mx-auto h-12 w-12 text-muted-foreground" />
											<p className="mt-2 text-sm text-muted-foreground">
												There are no CMRs assigned to
												current session
											</p>
										</div>
									)}
									<div className="flex justify-center my-4">
										<Button
											variant="success"
											onClick={() =>
												handleCreateCmr(activeSession)
											}
											title="Add CMR"
										>
											<Icons.Action.Create className="h-4 w-4" />{' '}
											Create CMR
										</Button>
									</div>
								</TabsContent>
							</Tabs>
						</div>
					) : (
						<div>
							<div className="text-center py-8 px-4 bg-muted rounded-lg border border-border">
								<Icons.WorkSession className="mx-auto h-12 w-12 text-muted-foreground" />
								<p className="mt-2 text-sm text-muted-foreground">
									There is no work session active at the
									moment!
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
