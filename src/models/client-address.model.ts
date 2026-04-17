import type { ClientModel } from '@/models/client.model';
import type { PlaceModel } from '@/models/place.model';

export enum ClientAddressTypeEnum {
	BILLING = 'billing',
	DELIVERY = 'delivery',
}

export type ClientAddressModel<D = Date | string> = {
	id: number;
	// client_id: number;
	address_type: ClientAddressTypeEnum;
	// city_id: number | null;
	details: string;
	postal_code: string | null;
	notes: string | null;
	client: ClientModel<D>;
	city: PlaceModel<D> | null;
	created_at: D;
	updated_at: D;
	deleted_at: D | null;
};

export type ClientAddressFormValuesType = Pick<
	ClientAddressModel,
	'address_type' | 'postal_code' | 'notes'
> & {
	client_id: number | null;
	client: string | null;
	city_id: number | null;
	city: string | null;
	details: string | null;
};
