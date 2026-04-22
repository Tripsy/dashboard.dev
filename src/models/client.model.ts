export const ClientTypeEnum = {
	PERSON: 'person',
	COMPANY: 'company',
} as const;

export type ClientType = (typeof ClientTypeEnum)[keyof typeof ClientTypeEnum];

export const ClientStatusEnum = {
	ACTIVE: 'active',
	INACTIVE: 'inactive',
	PENDING: 'pending',
} as const;

export type ClientStatus =
	(typeof ClientStatusEnum)[keyof typeof ClientStatusEnum];

// // Status transition configuration
// export const CLIENT_STATUS_TRANSITIONS: Record<
// 	ClientStatusEnum,
// 	ClientStatusEnum[]
// > = {
// 	[ClientStatusEnum.ACTIVE]: [ClientStatusEnum.INACTIVE],
// 	[ClientStatusEnum.INACTIVE]: [ClientStatusEnum.ACTIVE],
// 	[ClientStatusEnum.PENDING]: [
// 		ClientStatusEnum.ACTIVE,
// 		ClientStatusEnum.INACTIVE,
// 	],
// };

export type ClientIdentity =
	| {
			client_type: typeof ClientTypeEnum.COMPANY;

			company_name: string | null;
			company_cui: string | null;
			company_reg_com: string | null;

			person_name?: never;
			person_identification_number?: never;
	  }
	| {
			client_type: typeof ClientTypeEnum.PERSON;

			person_name: string | null;
			person_identification_number: string | null;

			company_name?: never;
			company_cui?: never;
			company_reg_com?: never;
	  };

export type ClientFinancial = {
	iban: string | null;
	bank_name: string | null;
};

export type ClientContact = {
	contact_name: string | null;
	contact_email: string | null;
	contact_phone: string | null;
};

type ClientBase<D = Date | string> = {
	id: number;

	status: ClientStatus;

	notes: string | null;

	created_at: D;
	updated_at: D;
	deleted_at: D;
};

export type ClientModel<D = Date | string> = ClientBase<D> &
	ClientIdentity &
	ClientFinancial &
	ClientContact;

export type ClientFormValuesType = {
	client_type: ClientType;

	company_name?: string | null;
	company_cui?: string | null;
	company_reg_com?: string | null;

	person_name?: string | null;
	person_identification_number?: string | null;
} & ClientFinancial &
	ClientContact & {
		notes: string | null;
	};

export function getClientDisplayName(client: ClientModel): string {
	if (client.client_type === ClientTypeEnum.COMPANY) {
		return client.company_name ?? '';
	}

	return client.person_name ?? '';
}
