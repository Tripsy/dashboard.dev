import { useCallback, useState } from 'react';
import { useWorkSession } from '@/app/(public)/_providers/work-session.provider';
import { Icons } from '@/components/icon.component';
import { LocationNavigator } from '@/components/location-navigator.component';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/helpers/date.helper';
import { DisplayStatus } from '@/helpers/display.helper';
import { arrayHasValue } from '@/helpers/objects.helper';
import { formatEnumLabel } from '@/helpers/string.helper';
import { displayAddressLabel } from '@/models/address.model';
import { displayClientLabel } from '@/models/client.model';
import { type CmrModel, CmrStatusEnum } from '@/models/cmr.model';
import type { CmrSessionModel } from '@/models/cmr-session.model';
import type { WorkSessionModel } from '@/models/work-session.model';
import { useModalStore } from '@/stores/window.store';
import { DataSourceSectionEnum } from '@/types/data-source.type';

const STATUS_ORDER: Record<string, number> = {
	preparing: 0,
	transit: 1,
	ordered: 2,
	delayed: 3,
	delivered: 4,
	cancelled: 5,
};

export function DriverPanelSessionCmrs({
	sessionCmrs,
}: {
	sessionCmrs: CmrSessionModel[];
}) {
	const sessionCmrsSorted = [...sessionCmrs].sort(
		(a, b) =>
			(STATUS_ORDER[a.cmr.status] ?? 99) -
			(STATUS_ORDER[b.cmr.status] ?? 99),
	);

	return (
		<div className="space-y-4">
			{sessionCmrsSorted.map((m) => (
				<div
					key={m.id}
					className="bg-card border border-border rounded-lg p-4"
				>
					<DriverPanelSessionCmrEntry
						cmr={m.cmr}
						workSession={m.work_session}
					/>
				</div>
			))}
		</div>
	);
}

export function DriverPanelSessionCmrEntry({
	cmr,
	workSession,
}: {
	cmr: CmrModel;
	workSession: WorkSessionModel;
}) {
	const { open } = useModalStore();
	const { refreshSession } = useWorkSession();

	const [withDetails, setWithDetails] = useState(false);

	const handleStatusTransition = useCallback(
		(entry: CmrModel) => {
			open({
				minimized: false,
				section: DataSourceSectionEnum.PUBLIC,
				dataSource: 'cmr',
				action: 'statusTransition',
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

	const handleSetupCmrVehicles = useCallback(
		(entry: CmrModel) => {
			open({
				minimized: false,
				section: DataSourceSectionEnum.PUBLIC,
				dataSource: 'cmr',
				action: 'setupVehicles',
				data: {
					entries: [entry],
				},
			});
		},
		[open],
	);

	// const handleUpdateSessionVehicle = useCallback(
	// 	(entry: WorkSessionVehicleModel) => {
	// 		open({
	// 			minimized: false,
	// 			section: DataSourceSectionEnum.PUBLIC,
	// 			dataSource: 'work-session-vehicle',
	// 			action: 'update',
	// 			data: {
	// 				entries: [entry],
	// 			},
	// 			definition: {
	// 				operationFunction: (
	// 					values: WorkSessionVehicleFormValuesType,
	// 				) => {
	// 					return updateWorkSessionVehicle(
	// 						values,
	// 						entry.id,
	// 						entry.work_session.id,
	// 					);
	// 				},
	// 			} as WindowDefinition<
	// 				WorkSessionVehicleFormValuesType,
	// 				WorkSessionVehicleModel
	// 			>,
	// 			events: {
	// 				success: async () => {
	// 					await refreshSession();
	// 				},
	// 			},
	// 		});
	// 	},
	// 	[open, refreshSession],
	// );
	//
	// const handleDeleteSessionVehicle = useCallback(
	// 	(entry: WorkSessionVehicleModel) => {
	// 		open({
	// 			minimized: false,
	// 			section: DataSourceSectionEnum.PUBLIC,
	// 			dataSource: 'work-session-vehicle',
	// 			action: 'delete',
	// 			data: {
	// 				entries: [entry],
	// 			},
	// 			events: {
	// 				success: async () => {
	// 					await refreshSession();
	// 				},
	// 			},
	// 		});
	// 	},
	// 	[open, refreshSession],
	// );

	return (
		<div className="flex justify-between">
			<div className="flex flex-col justify-between items-start self-stretch gap-2">
				<h3 className="font-semibold text-card-foreground flex items-center gap-4">
					<div className="flex items-center gap-1">
						{withDetails ? (
							<button
								type="button"
								onClick={() => setWithDetails(false)}
								title="Show less details"
								className="cursor-pointer text-muted-foreground"
							>
								<Icons.ArrowCurvedBottom className="h-4 w-4" />
							</button>
						) : (
							<button
								type="button"
								onClick={() => setWithDetails(true)}
								title="Show more details"
								className="cursor-pointer text-muted-foreground"
							>
								<Icons.ArrowRight className="h-4 w-4" />
							</button>
						)}
						CMR#{cmr.id}
					</div>
					<div>
						{arrayHasValue(cmr.status, [
							CmrStatusEnum.DELIVERED,
							CmrStatusEnum.CANCELLED,
						]) ? (
							<DisplayStatus
								status={cmr.status}
								dataSourceKey="cmr"
							/>
						) : (
							<button
								type="button"
								onClick={() => handleStatusTransition(cmr)}
								title="Update CMR status"
								className="cursor-pointer "
							>
								<DisplayStatus
									status={cmr.status}
									dataSourceKey="cmr"
								/>
							</button>
						)}
					</div>
				</h3>
				{withDetails && (
					<div className="flex items-center">
						<span className="text-muted-foreground">
							Last update at:
						</span>
						<span className="ml-2 font-mono">
							{formatDate(cmr.updated_at, undefined, {
								customFormat: 'D MMMM, HH:mm',
							})}
						</span>
					</div>
				)}
				{withDetails && cmr.notes && (
					<div className="flex items-center">
						<span className="text-muted-foreground">Notes:</span>
						<span className="ml-2 font-mono">{cmr.notes}</span>
					</div>
				)}
				<div>
					<span className="text-muted-foreground">Tracking:</span>
					<span className="ml-2 font-mono">
						{cmr.tracking_number}
					</span>
				</div>
				{withDetails && (
					<div className="flex">
						<div className="text-muted-foreground">Transport:</div>
						<div className="ml-4 font-mono">
							{formatEnumLabel(cmr.transport_type)}
						</div>
					</div>
				)}
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
				{withDetails && (
					<div className="flex items-center">
						<span className="text-muted-foreground">
							Ordered at:
						</span>
						<span className="ml-2 font-mono">
							{formatDate(cmr.ordered_at, undefined, {
								customFormat: 'D MMMM, HH:mm',
							})}
						</span>
					</div>
				)}
				{withDetails && (
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
				{(withDetails || cmr.status === CmrStatusEnum.ORDERED) && (
					<div className="flex flex-col">
						<div className="text-muted-foreground">
							Pickup address:
						</div>
						<div className="ml-4 font-mono">
							<LocationNavigator
								address={displayAddressLabel(
									cmr.pickup_address,
								)}
							/>
						</div>
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
				{(withDetails || cmr.status !== CmrStatusEnum.ORDERED) && (
					<div className="flex flex-col">
						<div className="text-muted-foreground">
							Delivery address:
						</div>
						<div className="ml-4 font-mono">
							<LocationNavigator
								address={displayAddressLabel(
									cmr.delivery_address,
								)}
							/>
						</div>
					</div>
				)}
				{cmr.status === CmrStatusEnum.DELIVERED && (
					<div className="flex items-center">
						<span className="text-muted-foreground">
							Delivered at:
						</span>
						<span className="ml-2 font-mono">
							{formatDate(cmr.delivered_at, undefined, {
								customFormat: 'D MMMM, HH:mm',
							})}
						</span>
					</div>
				)}
				{cmr.status === CmrStatusEnum.DELIVERED && (
					<div className="flex items-center">
						<span className="text-muted-foreground">Signed:</span>
						<span className="ml-2 font-mono">
							{cmr.signed_by ?? 'n/a'}
							{formatDate(cmr.signed_at, undefined, {
								customFormat: 'D MMMM, HH:mm',
							})}
						</span>
					</div>
				)}
			</div>

			<div className="flex flex-col justify-start gap-4">
				{!arrayHasValue(cmr.status, [
					CmrStatusEnum.CANCELLED,
					CmrStatusEnum.DELIVERED,
				]) && (
					<Button
						variant="secondary"
						hover="info"
						onClick={() => handleSetupCmrVehicles(cmr)}
						className="cursor-pointer"
						title="Setup CMR vehicles"
					>
						<Icons.Vehicle className="h-4 w-4" />
					</Button>
				)}
				<Button
					variant="secondary"
					hover="info"
					onClick={() => handleCreatePayment(cmr)}
					className="cursor-pointer"
					title="Create payment"
				>
					<Icons.Payment className="h-4 w-4" />
				</Button>
				{!arrayHasValue(cmr.status, [
					CmrStatusEnum.CANCELLED,
					CmrStatusEnum.DELIVERED,
				]) && (
					<Button
						variant="secondary"
						hover="info"
						onClick={() => handleUpdateCmr(cmr)}
						className="cursor-pointer"
						title="Update CMR"
					>
						<Icons.Action.Update className="h-4 w-4" />
					</Button>
				)}
				{!arrayHasValue(cmr.status, [
					CmrStatusEnum.CANCELLED,
					CmrStatusEnum.DELIVERED,
				]) && (
					<Button
						variant="secondary"
						hover="error"
						onClick={() => handleDeleteCmr(cmr)}
						className="cursor-pointer"
						title="Delete CMR"
					>
						<Icons.Action.Delete className="h-4 w-4" />
					</Button>
				)}
				{!arrayHasValue(cmr.status, [
					CmrStatusEnum.CANCELLED,
					CmrStatusEnum.DELIVERED,
				]) && (
					<Button
						variant="secondary"
						hover="error"
						onClick={() => handleDropCmr(cmr, workSession)}
						className="cursor-pointer"
						title="Drop CMR"
					>
						<Icons.Action.Drop className="h-4 w-4" />
					</Button>
				)}
			</div>
		</div>
	);
}
