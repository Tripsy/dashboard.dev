import { useCallback } from 'react';
import { useAvailableCmrWebSocket } from '@/app/(public)/_hooks/use-available-cmr-websocket.hook';
import { useWorkSession } from '@/app/(public)/_providers/work-session.provider';
import { Icons } from '@/components/icon.component';
import { LocationNavigator } from '@/components/location-navigator.component';
import {
	ErrorComponent,
	LoadingComponent,
} from '@/components/status.component';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/helpers/date.helper';
import { DisplayStatus } from '@/helpers/display.helper';
import { arrayHasValue } from '@/helpers/objects.helper';
import { formatEnumLabel } from '@/helpers/string.helper';
import { displayAddressLabel } from '@/models/address.model';
import { displayClientLabel } from '@/models/client.model';
import { type CmrModel, CmrStatusEnum } from '@/models/cmr.model';
import type { WorkSessionModel } from '@/models/work-session.model';
import { createCmrSession } from '@/services/cmr-session.service';
import { useModalStore } from '@/stores/window.store';

export function DriverPanelAvailableCmrs() {
	const { entries: cmrs, wsStatus } = useAvailableCmrWebSocket();

	if (wsStatus === 'connecting') {
		return <LoadingComponent className="min-h-[calc(40vh-4rem)]" />;
	}

	if (wsStatus === 'terminated') {
		return (
			<ErrorComponent
				description="Connection aborted"
				className="min-h-[calc(40vh-4rem)]"
			/>
		);
	}

	if (wsStatus === 'error' || wsStatus === 'disconnected') {
		return (
			<LoadingComponent
				description="Connection lost — reconnecting…"
				className="min-h-[calc(40vh-4rem)]"
			/>
		);
	}

	return (
		<div className="space-y-4">
			{cmrs.length === 0 ? (
				<div className="text-center py-8 px-4 bg-muted rounded-lg border border-border">
					<p className="text-sm text-muted-foreground">
						No CMRs for this session yet
					</p>
				</div>
			) : (
				cmrs.map((cmr) => (
					<div
						key={cmr.id}
						className="bg-card border border-border rounded-lg p-4"
					>
						<DriverPanelAvailableCmrEntry cmr={cmr} />
					</div>
				))
			)}
		</div>
	);
}

function DriverPanelAvailableCmrEntry({ cmr }: { cmr: CmrModel }) {
	const { setActiveTab, activeSession, refreshSession } = useWorkSession();

	const handleAssignCmr = useCallback(
		async (cmr: CmrModel, activeSession: WorkSessionModel | null) => {
			if (!activeSession) {
				return;
			}

			await createCmrSession(
				{
					work_session_id: activeSession.id,
				},
				cmr.id,
			);

			await refreshSession();

			setActiveTab('sessionCmrs');
		},
		[refreshSession, setActiveTab],
	);

	const deliveryAddress = cmr.delivery_address
		? displayAddressLabel(cmr.delivery_address)
		: null;
	const pickupAddress = cmr.pickup_address
		? displayAddressLabel(cmr.pickup_address)
		: null;

	return (
		<div className="flex justify-between">
			<div className="flex flex-col justify-between items-start self-stretch gap-2">
				<h3 className="flex items-center gap-4">
					<div className="font-semibold text-card-foreground ">
						CMR#{cmr.id}
					</div>
					<DisplayStatus status={cmr.status} dataSource="cmr" />

					<Button
						variant="info"
						onClick={() => handleAssignCmr(cmr, activeSession)}
						title="Assign CMR to my work session"
						className="text-sm px-2 py-1.5"
					>
						<Icons.Action.Add /> Assign to me
					</Button>
				</h3>
				<div className="flex items-center">
					<span className="text-muted-foreground">Notes:</span>
					<span className="ml-2 font-mono">{cmr.notes}</span>
				</div>
				<div className="flex">
					<div className="text-muted-foreground">Transport:</div>
					<div className="ml-4 font-mono">
						{formatEnumLabel(cmr.transport_type)}
					</div>
				</div>
				<div>
					<span className="text-muted-foreground">Client:</span>
					<span className="ml-2 font-mono">
						{displayClientLabel(cmr.client)}
					</span>
				</div>
				<div>
					<span className="text-muted-foreground">Contact:</span>
					<span className="ml-2 font-mono flex gap-2">
						{cmr.contact_name}
						<a href={`tel:${cmr.contact_phone}`}>
							{cmr.contact_phone}
						</a>
					</span>
				</div>
				<div className="flex items-center">
					<span className="text-muted-foreground">Ordered at:</span>
					<span className="ml-2 font-mono">
						{formatDate(cmr.ordered_at, undefined, {
							customFormat: 'D MMMM, HH:mm',
						})}
					</span>
				</div>
				{cmr.status === CmrStatusEnum.ORDERED && (
					<div className="flex items-center">
						<span className="text-muted-foreground">
							Pick scheduled at:
						</span>
						<span className="ml-2 font-mono">
							{formatDate(cmr.pick_scheduled_at, undefined, {
								customFormat: 'D MMMM, HH:mm',
							}) ?? 'n/a'}
						</span>
					</div>
				)}
				{cmr.status === CmrStatusEnum.ORDERED && (
					<div className="flex flex-col">
						<div className="text-muted-foreground flex items-center gap-2">
							Pickup address:
							<LocationNavigator address={pickupAddress} />
						</div>
						<div className="ml-4 font-mono">{pickupAddress}</div>
					</div>
				)}
				{arrayHasValue(cmr.status, [
					CmrStatusEnum.ORDERED,
					CmrStatusEnum.PREPARING,
					CmrStatusEnum.TRANSIT,
					CmrStatusEnum.DELAYED,
				]) && (
					<div className="flex items-center">
						<span className="text-muted-foreground">
							Estimated delivery at:
						</span>
						<span className="ml-2 font-mono">
							{formatDate(cmr.estimated_delivery_at, undefined, {
								customFormat: 'D MMMM, HH:mm',
							}) ?? 'n/a'}
						</span>
					</div>
				)}
				<div className="flex flex-col">
					<div className="text-muted-foreground flex items-center gap-2">
						Delivery address:
						<LocationNavigator address={deliveryAddress} />
					</div>
					<div className="ml-4 font-mono">{deliveryAddress}</div>
				</div>
			</div>
		</div>
	);
}
