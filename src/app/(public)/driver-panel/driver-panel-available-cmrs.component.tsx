import { useAttachCmrToSession } from '@/app/(public)/_hooks/use-attach-cmr-to-session.hook';
import { useAvailableCmr } from '@/app/(public)/_providers/available-cmr.provider';
import { useWorkSession } from '@/app/(public)/_providers/work-session.provider';
import {
	CmrAddressRow,
	CmrContactRow,
} from '@/app/(public)/driver-panel/driver-panel-cmr-fields.component';
import { Icons } from '@/components/icon.component';
import {
	ErrorComponent,
	LoadingComponent,
} from '@/components/status.component';
import { Button } from '@/components/ui/button';
import { getLanguageClient } from '@/config/translate.setup';
import { formatDate } from '@/helpers/date.helper';
import { DisplayStatus } from '@/helpers/display.helper';
import { arrayHasValue } from '@/helpers/objects.helper';
import { formatEnumLabel } from '@/helpers/string.helper';
import { displayAddressLabel } from '@/models/address.model';
import { displayClientLabel } from '@/models/client.model';
import { type CmrModel, CmrStatusEnum } from '@/models/cmr.model';

export function DriverPanelAvailableCmrs() {
	const {
		entries: cmrs,
		wsStatus,
		errorMessage,
		reconnect,
	} = useAvailableCmr();

	if (wsStatus === 'connecting') {
		return <LoadingComponent className="min-h-[calc(40vh-4rem)]" />;
	}

	if (wsStatus === 'terminated') {
		return (
			<div className="min-h-[calc(40vh-4rem)] flex flex-col items-center justify-center gap-4">
				<ErrorComponent
					description={errorMessage ?? 'Connection aborted'}
				/>
				<Button onClick={reconnect} title="Reconnect">
					<Icons.Action.Return className="h-4 w-4" /> Reconnect
				</Button>
			</div>
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
				<div className="text-center py-8 px-4 bg-surface-secondary rounded-lg border border-border">
					<p className="text-sm text-muted">
						No CMRs for this session yet
					</p>
				</div>
			) : (
				cmrs.map((cmr) => (
					<div
						key={cmr.id}
						className="bg-surface border border-border rounded-lg p-4"
					>
						<DriverPanelAvailableCmrEntry cmr={cmr} />
					</div>
				))
			)}
		</div>
	);
}

function DriverPanelAvailableCmrEntry({ cmr }: { cmr: CmrModel }) {
	const { activeSession, activeSessionVehicleAuto } = useWorkSession();
	const attachCmrToSession = useAttachCmrToSession();

	const language = getLanguageClient();

	const deliveryAddress = cmr.delivery_address
		? displayAddressLabel(cmr.delivery_address, language)
		: null;
	const pickupAddress = cmr.pickup_address
		? displayAddressLabel(cmr.pickup_address, language)
		: null;

	return (
		<div className="flex justify-between">
			<div className="flex flex-col justify-between items-start self-stretch gap-2">
				<h3 className="flex items-center gap-4">
					<div className="font-semibold text-surface-foreground ">
						CMR#{cmr.id}
					</div>
					<DisplayStatus status={cmr.status} dataSource="cmr" />

					{activeSession && activeSessionVehicleAuto && (
						<Button
							variant="default"
							onClick={() => attachCmrToSession(cmr.id)}
							title="Assign CMR to my work session"
							className="text-sm px-2 py-1.5"
						>
							<Icons.Action.Add /> Assign to me
						</Button>
					)}
				</h3>
				<div className="flex items-center">
					<span className="text-muted">Notes:</span>
					<span className="ml-2 font-mono">{cmr.notes}</span>
				</div>
				<div className="flex">
					<div className="text-muted">Transport:</div>
					<div className="ml-4 font-mono">
						{formatEnumLabel(cmr.transport_type)}
					</div>
				</div>
				<div>
					<span className="text-muted">Client:</span>
					<span className="ml-2 font-mono">
						{displayClientLabel(cmr.client)}
					</span>
				</div>
				<CmrContactRow
					name={cmr.contact_name}
					phone={cmr.contact_phone}
				/>
				<div className="flex items-center">
					<span className="text-muted">Ordered at:</span>
					<span className="ml-2 font-mono">
						{formatDate(cmr.ordered_at, undefined, {
							customFormat: 'D MMMM, HH:mm',
						})}
					</span>
				</div>
				{cmr.status === CmrStatusEnum.ORDERED && (
					<div className="flex items-center">
						<span className="text-muted">Pick scheduled at:</span>
						<span className="ml-2 font-mono">
							{formatDate(cmr.pick_scheduled_at, undefined, {
								customFormat: 'D MMMM, HH:mm',
							}) ?? 'n/a'}
						</span>
					</div>
				)}
				{cmr.status === CmrStatusEnum.ORDERED && (
					<CmrAddressRow
						label="Pickup address"
						address={pickupAddress}
					/>
				)}
				{arrayHasValue(cmr.status, [
					CmrStatusEnum.ORDERED,
					CmrStatusEnum.PREPARING,
					CmrStatusEnum.TRANSIT,
					CmrStatusEnum.DELAYED,
				]) && (
					<div className="flex items-center">
						<span className="text-muted">
							Estimated delivery at:
						</span>
						<span className="ml-2 font-mono">
							{formatDate(cmr.estimated_delivery_at, undefined, {
								customFormat: 'D MMMM, HH:mm',
							}) ?? 'n/a'}
						</span>
					</div>
				)}
				<CmrAddressRow
					label="Delivery address"
					address={deliveryAddress}
				/>
			</div>
		</div>
	);
}
