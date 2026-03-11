export enum ClientTypeEnum {
	PERSON = 'person',
	COMPANY = 'company',
}

export enum ClientStatusEnum {
	ACTIVE = 'active',
	INACTIVE = 'inactive',
	PENDING = 'pending',
}

// Status transition configuration
export const CLIENT_STATUS_TRANSITIONS: Record<
	ClientStatusEnum,
	ClientStatusEnum[]
> = {
	[ClientStatusEnum.ACTIVE]: [ClientStatusEnum.INACTIVE],
	[ClientStatusEnum.INACTIVE]: [ClientStatusEnum.ACTIVE],
	[ClientStatusEnum.PENDING]: [
		ClientStatusEnum.ACTIVE,
		ClientStatusEnum.INACTIVE,
	],
};

export type ClientAddress = {
	address_country: number | null;
	address_region: number | null;
	address_city: number | null;
	address_info: string | null;
	address_postal_code: number | null;
};

export type ClientContact = {
	contact_name: string | null;
	contact_email: string | null;
	contact_phone: string | null;
};

export type ClientFinancial = {
	iban: string | null;
	bank_name: string | null;
};

// Discriminated union ensures that company and person fields cannot exist together.

export type ClientIdentity =
	| {
			client_type: ClientTypeEnum.COMPANY;

			company_name: string | null;
			company_cui: string | null;
			company_reg_com: string | null;

			person_name?: never;
			person_cnp?: never;
	  }
	| {
			client_type: ClientTypeEnum.PERSON;

			person_name: string | null;
			person_cnp: string | null;

			company_name?: never;
			company_cui?: never;
			company_reg_com?: never;
	  };

type ClientBase<D = Date | string> = {
	id: number;

	status: ClientStatusEnum;

	notes: string | null;

	created_at: D;
	updated_at: D;
	deleted_at: D;
};

export type ClientModel<D = Date | string> = ClientBase<D> &
	ClientIdentity &
	ClientFinancial;

export type ClientFormValuesType = ClientIdentity &
	ClientFinancial &
	ClientContact &
	ClientAddress & {
		status: ClientStatusEnum;
		notes: string | null;
	};
