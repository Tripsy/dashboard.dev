import type { ClientModel } from '@/models/client.model';
import type { PlaceModel } from '@/models/place.model';

export const ClientAddressTypeEnum = {
	BILLING: 'billing',
	DELIVERY: 'delivery',
} as const;

export type ClientAddressType =
	(typeof ClientAddressTypeEnum)[keyof typeof ClientAddressTypeEnum];

export type ClientAddressModel<D = Date | string> = {
	id: number;
	address_type: ClientAddressType;

	client: ClientModel<D>;

	city: PlaceModel<D> | null;
	details: string;
	postal_code: string | null;

	notes: string | null;

	created_at: D;
	updated_at: D;
	deleted_at: D | null;
};
