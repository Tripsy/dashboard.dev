import { formatDate } from '@/helpers/date.helper';
import type { AddressModel } from '@/models/address.model';
import { type ClientModel, displayClientLabel } from '@/models/client.model';
import type { StatusTransitions } from '@/types/common.type';

export const CmrStatusEnum = {
	ORDERED: 'ordered',
	PREPARING: 'preparing',
	TRANSIT: 'transit',
	DELIVERED: 'delivered',
	CANCELLED: 'cancelled',
	DELAYED: 'delayed',
} as const;

export type CmrStatus = (typeof CmrStatusEnum)[keyof typeof CmrStatusEnum];

// Allowed status transition configuration
export const STATUS_TRANSITIONS: StatusTransitions<CmrStatus> = {
	[CmrStatusEnum.ORDERED]: [
		CmrStatusEnum.PREPARING,
		CmrStatusEnum.TRANSIT,
		CmrStatusEnum.DELIVERED,
		CmrStatusEnum.CANCELLED,
		CmrStatusEnum.DELAYED,
	],
	[CmrStatusEnum.PREPARING]: [
		CmrStatusEnum.TRANSIT,
		CmrStatusEnum.DELIVERED,
		CmrStatusEnum.CANCELLED,
		CmrStatusEnum.DELAYED,
	],
	[CmrStatusEnum.TRANSIT]: [
		CmrStatusEnum.DELIVERED,
		CmrStatusEnum.CANCELLED,
		CmrStatusEnum.DELAYED,
	],
	[CmrStatusEnum.DELIVERED]: [],
	[CmrStatusEnum.CANCELLED]: [],
	[CmrStatusEnum.DELAYED]: [
		CmrStatusEnum.PREPARING,
		CmrStatusEnum.TRANSIT,
		CmrStatusEnum.DELIVERED,
		CmrStatusEnum.CANCELLED,
	],
};

export const CmrTransportTypeEnum = {
	DOMESTIC: 'domestic',
	INTERNATIONAL: 'international',
} as const;

export type CmrTransportType =
	(typeof CmrTransportTypeEnum)[keyof typeof CmrTransportTypeEnum];

export type CmrModel<D = Date | string> = {
	id: number;

	status: CmrStatus;
	transport_type: CmrTransportType;

	client: ClientModel;
	pickup_address: AddressModel;
	delivery_address: AddressModel;

	// tracking
	tracking_number: string;
	tracking_url: string | null;

	// contact
	contact_name: string | null;
	contact_phone: string | null;
	contact_email: string | null;

	// dates
	ordered_at: D | null;
	pick_scheduled_at: D | null;
	estimated_delivery_at: D | null;
	delivered_at: D | null;

	// other
	notes: string | null;

	// client related
	signed_at: D | null;
	signed_by: string | null;
	signed_data: string | null;

	created_at: D;
	updated_at: D;
	deleted_at: D;
};

export function displayCmrLabel(entry: CmrModel): string {
	return `${displayClientLabel(entry.client)} ${formatDate(entry.ordered_at, 'default')}`;
}
