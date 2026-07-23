'use client';

import { useCallback } from 'react';
import {
	prepareParamsFromFormValues,
	type WorkSessionCreateOutput,
} from '@/app/(public)/_components/work-session/work-session.definition';
import { useWorkSession } from '@/app/(public)/_providers/work-session.provider';
import { DriverPanelAvailableCmrs } from '@/app/(public)/driver-panel/driver-panel-available-cmrs.component';
import { DriverPanelAvailableCompanyVehicles } from '@/app/(public)/driver-panel/driver-panel-available-company-vehicles.component';
import { DriverPanelSession } from '@/app/(public)/driver-panel/driver-panel-session.component';
import { DriverPanelSessionCashFlow } from '@/app/(public)/driver-panel/driver-panel-session-cash-flow.component';
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
import type { WorkSessionModel } from '@/models/work-session.model';
import { useAuth } from '@/providers/auth.provider';
import { useModalStore } from '@/stores/window.store';
import { DataSourceSectionEnum } from '@/types/data-source.type';

export function DriverPanel() {
	const {
		activeTab,
		setActiveTab,
		sessionSituation,
		activeSession,
		activeSessionVehicles,
		availableCompanyVehicles,
		workSessionCmrs,
		refreshSession,
		sessionCashFlowEntries,
	} = useWorkSession();
	const { auth } = useAuth();
	const { open } = useModalStore();

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
			},
			events: {
				success: async () => {
					await refreshSession();
				},
			},
		});
	}, [open, refreshSession, auth]);

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
						<div className="space-y-4">
							<DriverPanelSession />

							<Tabs
								selectedKey={activeTab}
								onSelectionChange={(key) =>
									setActiveTab(String(key))
								}
								className="w-full"
							>
								<TabsList
									className="grid w-full grid-cols-2 sm:grid-cols-4 p-2 "
									containerClassName="bg-transparent rounded-none"
								>
									<TabsTrigger
										id="sessionVehicles"
										className="font-semibold"
									>
										Session Vehicles
									</TabsTrigger>
									<TabsTrigger
										id="sessionCmrs"
										className="font-semibold"
									>
										Session CMRs
									</TabsTrigger>
									<TabsTrigger
										id="sessionCashFlowEntries"
										className="font-semibold"
									>
										Cash Flow
									</TabsTrigger>
									<TabsTrigger
										id="availableCmrs"
										className="font-semibold"
									>
										Available CMRs
									</TabsTrigger>
								</TabsList>

								<TabsContent
									id="sessionVehicles"
									className="p-0 mt-2"
								>
									{activeSessionVehicles.length > 0 ? (
										<DriverPanelSessionVehicles
											sessionVehicles={
												activeSessionVehicles
											}
										/>
									) : (
										<div className="text-center py-8 px-4 bg-surface-secondary rounded-lg border border-border">
											<Icons.Vehicle className="mx-auto h-12 w-12 text-muted" />
											<p className="mt-2 text-sm text-muted">
												There are no vehicles assigned
												to current session
											</p>
										</div>
									)}
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

								<TabsContent
									id="sessionCmrs"
									className="p-0 mt-2"
								>
									{workSessionCmrs.length > 0 ? (
										<DriverPanelSessionCmrs
											sessionCmrs={workSessionCmrs}
										/>
									) : (
										<div className="text-center py-8 px-4 bg-surface-secondary rounded-lg border border-border">
											<Icons.Cmr className="mx-auto h-12 w-12 text-muted" />
											<p className="mt-2 text-sm text-muted">
												There are no CMRs assigned to
												current session
											</p>
										</div>
									)}
								</TabsContent>

								<TabsContent
									id="sessionCashFlowEntries"
									className="p-0 mt-2"
								>
									<DriverPanelSessionCashFlow
										entries={sessionCashFlowEntries}
									/>
								</TabsContent>

								<TabsContent
									id="availableCmrs"
									className="p-0 mt-2"
								>
									<DriverPanelAvailableCmrs />
								</TabsContent>
							</Tabs>
						</div>
					) : (
						<div>
							<div className="text-center py-8 px-4 bg-surface-secondary rounded-lg border border-border">
								<Icons.WorkSession className="mx-auto h-12 w-12 text-muted" />
								<p className="mt-2 text-sm text-muted">
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
