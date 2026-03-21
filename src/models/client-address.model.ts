import type { ClientModel } from '@/models/client.model';
import type { PlaceModel } from '@/models/place.model';

export enum ClientAddressTypeEnum {
	BILLING = 'billing',
	DELIVERY = 'delivery',
}

export type ClientAddressModel<D = Date | string> = {
	id: number;
	client_id: number;
	address_type: ClientAddressTypeEnum;
	city_id: number | null;
	details: string;
	postal_code: string | null;
	notes: string | null;
	city: PlaceModel<D> | null;
	client: ClientModel<D>;
	created_at: D;
	updated_at: D;
	deleted_at: D | null;
};

export type ClientAddressFormValuesType = Omit<
	ClientAddressModel,
	| 'id'
	| 'city'
	| 'client'
	| 'created_at'
	| 'updated_at'
	| 'deleted_at'
	| 'client_id'
> & {
	client_id: number | null;
};
