export enum ClientAddressTypeEnum {
	BILLING = 'billing',
	DELIVERY = 'delivery',
}

export type ClientAddressModel<D = Date | string> = {
	id: number;
	client_id: number;
	address_type: ClientAddressTypeEnum;
	address_city_id: number | null;
	address_info: string;
	address_postal_code: string | null;
	notes: string | null;
	created_at: D;
	updated_at: D;
	deleted_at: D | null;
};

export type ClientAddressFormValuesType = Pick<
	ClientAddressModel,
	| 'client_id'
	| 'address_type'
	| 'address_city_id'
	| 'address_info'
	| 'address_postal_code'
	| 'notes'
>;
