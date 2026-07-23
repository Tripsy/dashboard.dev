import { useCallback, useState } from 'react';
import { useWorkSession } from '@/app/(public)/_providers/work-session.provider';
import { Icons } from '@/components/icon.component';
import { LocationNavigator } from '@/components/location-navigator.component';
import { Button } from '@/components/ui/button';
import { Link } from '@/components/ui/link';
import { WhatsAppContact } from '@/components/whatsapp-contact';
import Routes from '@/config/routes.setup';
import { getLanguageClient } from '@/config/translate.setup';
import { formatDate } from '@/helpers/date.helper';
import { DisplayStatus } from '@/helpers/display.helper';
import { arrayHasValue } from '@/helpers/objects.helper';
import { formatEnumLabel } from '@/helpers/string.helper';
import { displayAddressLabel } from '@/models/address.model';
import {
	CashFlowCategoryEnum,
	OperationalRecordTypeEnum,
} from '@/models/cash-flow.model';
import { displayClientLabel } from '@/models/client.model';
import { type CmrModel, CmrStatusEnum } from '@/models/cmr.model';
import type { CmrSessionModel } from '@/models/cmr-session.model';
import { useModalStore } from '@/stores/window.store';
import { DataSourceSectionEnum } from '@/types/data-source.type';

const STATUS_ORDER: Record<string, number> = {
	preparing: 0,
	transit: 1,
	ordered: 2,
	delayed: 3,
	delivered: 4,
	canceled: 5,
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
					className="bg-surface border border-border rounded-lg p-4"
				>
					<DriverPanelSessionCmrEntry cmr={m.cmr} cmrSession={m} />
				</div>
			))}
		</div>
	);
}

function DriverPanelSessionCmrEntry({
	cmr,
	cmrSession,
}: {
	cmr: CmrModel;
	cmrSession: CmrSessionModel;
}) {
	const { open } = useModalStore();
	const {
		setActiveTab,
		activeSession,
		refreshSession,
		refetchSessionCashFlowEntries,
	} = useWorkSession();

	const [withDetails, setWithDetails] = useState(false);
	const language = getLanguageClient();

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

	const handleViewCmrImages = useCallback(
		(entry: CmrModel) => {
			open({
				minimized: false,
				section: DataSourceSectionEnum.PUBLIC,
				dataSource: 'cmr',
				action: 'managerImages',
				data: {
					entries: [entry],
				},
			});
		},
		[open],
	);

	const handleUpdateCmr = useCallback(
		(entry: CmrModel) => {
			open({
				minimized: false,
				section: DataSourceSectionEnum.PUBLIC,
				dataSource: 'cmr',
				action: 'update',
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

	const handleDeleteCmr = useCallback(
		(entry: CmrModel) => {
			open({
				minimized: false,
				section: DataSourceSectionEnum.PUBLIC,
				dataSource: 'cmr',
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

	const handleDropCmr = useCallback(
		(entry: CmrSessionModel) => {
			open({
				minimized: false,
				section: DataSourceSectionEnum.PUBLIC,
				dataSource: 'cmr-session',
				action: 'drop',
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

	const handleCreatePaymentCustomer = useCallback(
		(entry: CmrModel) => {
			open({
				minimized: false,
				section: DataSourceSectionEnum.PUBLIC,
				dataSource: 'cash-flow',
				action: 'create',
				data: {
					prefillEntry: {
						category: CashFlowCategoryEnum.CUSTOMER,
						operational_records: {
							[OperationalRecordTypeEnum.CLIENT]: entry.client,
							[OperationalRecordTypeEnum.EMPLOYEE]:
								activeSession?.user,
							[OperationalRecordTypeEnum.CMR]: entry,
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
		[open, activeSession, refetchSessionCashFlowEntries, setActiveTab],
	);

	const deliveryAddress = cmr.delivery_address
		? displayAddressLabel(cmr.delivery_address, language)
		: null;
	const pickupAddress = cmr.pickup_address
		? displayAddressLabel(cmr.pickup_address, language)
		: null;
	const contactPhone = cmr.contact_phone;

	return (
		<div className="flex justify-between">
			<div className="flex flex-col justify-between items-start self-stretch gap-2">
				<h3 className="flex items-center gap-4">
					{withDetails ? (
						<Button
							variant="outline"
							onClick={() => setWithDetails(false)}
							title="Show less details"
							className="py-1.5 px-2"
						>
							<Icons.Direction.ArrowCurvedBottom className="h-4 w-4" />
						</Button>
					) : (
						<Button
							variant="outline"
							onClick={() => setWithDetails(true)}
							title="Show more details"
							className="py-1.5 px-2"
						>
							<Icons.Direction.ArrowRight className="h-4 w-4" />
						</Button>
					)}
					<div className="font-semibold text-surface-foreground ">
						CMR#{cmr.id}
					</div>
					{arrayHasValue(cmr.status, [
						CmrStatusEnum.DELIVERED,
						CmrStatusEnum.CANCELLED,
					]) ? (
						<DisplayStatus status={cmr.status} dataSource="cmr" />
					) : (
						<Button
							variant="ghost"
							onClick={() => handleStatusTransition(cmr)}
							title="Update CMR status"
						>
							<DisplayStatus
								status={cmr.status}
								dataSource="cmr"
							/>
						</Button>
					)}
				</h3>
				{withDetails && (
					<div className="flex items-center">
						<span className="text-muted">Last update at:</span>
						<span className="ml-2 font-mono">
							{formatDate(cmr.updated_at, undefined, {
								customFormat: 'D MMMM, HH:mm',
							})}
						</span>
					</div>
				)}
				{withDetails && cmr.notes && (
					<div className="flex items-center">
						<span className="text-muted">Notes:</span>
						<span className="ml-2 font-mono">{cmr.notes}</span>
					</div>
				)}
				{withDetails && (
					<div>
						<span className="text-muted">Tracking:</span>
						<span className="ml-2 font-mono">
							{cmr.tracking_number}
						</span>
					</div>
				)}
				{withDetails && (
					<div className="flex">
						<div className="text-muted">Transport:</div>
						<div className="ml-4 font-mono">
							{formatEnumLabel(cmr.transport_type)}
						</div>
					</div>
				)}
				<div>
					<span className="text-muted">Client:</span>
					<span className="ml-2 font-mono">
						{displayClientLabel(cmr.client)}
					</span>
				</div>
				<div className="flex items-center gap-2">
					<div className="text-muted">Contact:</div>
					<div className="font-mono">{cmr.contact_name}</div>
					{cmr.contact_phone && (
						<div>
							<a href={`tel:${cmr.contact_phone}`}>
								{cmr.contact_phone}
							</a>
						</div>
					)}
					{cmr.contact_phone && (
						<div>
							<WhatsAppContact
								phone={cmr.contact_phone}
								message="Here is the CMR"
							/>
						</div>
					)}
				</div>
				{withDetails && (
					<div className="flex items-center">
						<span className="text-muted">Ordered at:</span>
						<span className="ml-2 font-mono">
							{formatDate(cmr.ordered_at, undefined, {
								customFormat: 'D MMMM, HH:mm',
							})}
						</span>
					</div>
				)}
				{withDetails && (
					<div className="flex items-center">
						<span className="text-muted">Pick scheduled at:</span>
						<span className="ml-2 font-mono">
							{formatDate(cmr.pick_scheduled_at, undefined, {
								customFormat: 'D MMMM, HH:mm',
							}) ?? 'n/a'}
						</span>
					</div>
				)}
				{(withDetails || cmr.status === CmrStatusEnum.ORDERED) && (
					<div className="flex flex-col">
						<div className="text-muted flex items-center gap-2">
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
				<div className="flex flex-col">
					<div className="text-muted flex items-center gap-2">
						Delivery address:
						<LocationNavigator address={deliveryAddress} />
					</div>
					<div className="ml-4 font-mono">{deliveryAddress}</div>
				</div>
				{cmr.status === CmrStatusEnum.DELIVERED && (
					<div className="flex items-center">
						<span className="text-muted">Delivered at:</span>
						<span className="ml-2 font-mono">
							{formatDate(cmr.delivered_at, undefined, {
								customFormat: 'D MMMM, HH:mm',
							})}
						</span>
					</div>
				)}
				{cmr.status === CmrStatusEnum.DELIVERED && (
					<div className="flex items-center">
						<span className="text-muted">Signed:</span>
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
						hover="default"
						onClick={() => handleSetupCmrVehicles(cmr)}
						title="Setup CMR vehicles"
					>
						<Icons.Vehicle className="h-4 w-4" />
					</Button>
				)}
				<Button
					variant="secondary"
					hover="default"
					onClick={() => handleViewCmrImages(cmr)}
					title="View CMR images"
				>
					<Icons.Image className="h-4 w-4" />
				</Button>
				<Button
					variant="secondary"
					hover="default"
					onClick={() => handleCreatePaymentCustomer(cmr)}
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
						hover="default"
						onClick={() => handleUpdateCmr(cmr)}
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
						onClick={() => handleDropCmr(cmrSession)}
						title="Drop CMR"
					>
						<Icons.Action.Drop className="h-4 w-4" />
					</Button>
				)}
				{!arrayHasValue(cmr.status, [CmrStatusEnum.CANCELLED]) &&
					contactPhone && (
						<Link
							href={Routes.get('document-cmr', {
								tracking_number: cmr.tracking_number,
							})}
							variant="secondary"
							hover="success"
							title="View CMR"
							target="_blank"
							rel="noopener noreferrer"
						>
							<Icons.Share className="h-4 w-4" />
						</Link>
					)}
			</div>
		</div>
	);
}
