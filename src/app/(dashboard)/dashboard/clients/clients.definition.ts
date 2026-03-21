import { z } from 'zod';
import {
	type DataTableColumnType,
	DataTableValue,
} from '@/app/(dashboard)/_components/data-table-value';
import type { FormStateType } from '@/config/data-source.config';
import { translateBatch } from '@/config/translate.setup';
import { BaseValidator } from '@/helpers/validator.helper';
import {
	type ClientFormValuesType,
	type ClientModel,
	ClientStatusEnum,
	ClientTypeEnum,
	getClientDisplayName,
} from '@/models/client.model';
import {
	createClient,
	deleteClient,
	disableClient,
	enableClient,
	findClients,
	restoreClient,
	updateClient,
} from '@/services/clients.service';

const translationValidation = await translateBatch(
	[
		'clients.validation.invalid_client_type',
		'clients.validation.invalid_iban',
		'clients.validation.invalid_bank_name',
		'clients.validation.invalid_contact_name',
		'clients.validation.invalid_contact_email',
		'clients.validation.invalid_contact_phone',
		'clients.validation.invalid_notes',
		'clients.validation.invalid_company_name',
		'clients.validation.invalid_company_cui',
		'clients.validation.invalid_company_reg_com',
		'clients.validation.invalid_person_name',
		'clients.validation.invalid_person_identification_number',
	],
	'clients.validation.',
);

class ClientValidator extends BaseValidator {
	constructor(private readonly message: Record<string, string>) {
		super();
	}

	baseSchema() {
		return {
			iban: this.validateIBAN(this.message.invalid_iban, {
				required: false,
			}),
			bank_name: this.validateString(this.message.invalid_bank_name, {
				required: false,
			}),
			contact_name: this.validateString(
				this.message.invalid_contact_name,
				{
					required: false,
				},
			),
			contact_email: this.validateEmail(
				this.message.invalid_contact_email,
				{
					required: false,
				},
			),
			contact_phone: this.validatePhone(
				this.message.invalid_contact_phone,
				{
					required: false,
				},
			),
			notes: this.validateString(this.message.invalid_notes, {
				required: false,
			}),
		};
	}

	manage() {
		return z.discriminatedUnion('client_type', [
			// Company schema
			z
				.object({
					client_type: z.literal(ClientTypeEnum.COMPANY),
					company_name: this.validateString(
						this.message.invalid_company_name,
					),
					company_cui: this.validateString(
						this.message.invalid_company_cui,
					),
					company_reg_com: this.validateString(
						this.message.invalid_company_reg_com,
						{
							required: false,
						},
					),
					person_name: z.never().optional(),
					person_identification_number: z.never().optional(),
				})
				.extend(this.baseSchema()),

			// Person schema
			z
				.object({
					client_type: z.literal(ClientTypeEnum.PERSON),
					company_name: z.never().optional(),
					company_cui: z.never().optional(),
					company_reg_com: z.never().optional(),
					person_name: this.validateString(
						this.message.invalid_person_name,
					),
					person_identification_number:
						this.validatePersonalIdentificationNumber(
							this.message.invalid_person_identification_number,
							{
								required: false,
							},
						),
				})
				.extend(this.baseSchema()),
		]);
	}
}

export function getFormValuesClient(formData: FormData): ClientFormValuesType {
	const client_type = formData.get('client_type') as ClientTypeEnum;

	const base = {
		notes: (formData.get('notes') as string) || null,

		iban: (formData.get('iban') as string) || null,
		bank_name: (formData.get('bank_name') as string) || null,

		contact_name: (formData.get('contact_name') as string) || null,
		contact_email: (formData.get('contact_email') as string) || null,
		contact_phone: (formData.get('contact_phone') as string) || null,
	};

	if (client_type === ClientTypeEnum.COMPANY) {
		return {
			...base,
			client_type: ClientTypeEnum.COMPANY,

			company_name: (formData.get('company_name') as string) || null,
			company_cui: (formData.get('company_cui') as string) || null,
			company_reg_com:
				(formData.get('company_reg_com') as string) || null,
		};
	}

	return {
		...base,
		client_type: ClientTypeEnum.PERSON,

		person_name: (formData.get('person_name') as string) || null,
		person_identification_number:
			(formData.get('person_identification_number') as string) || null,
	};
}

export type ClientsDataTableFiltersType = {
	global: { value: string | null; matchMode: 'contains' };
	status: { value: ClientStatusEnum | null; matchMode: 'equals' };
	client_type: { value: ClientTypeEnum | null; matchMode: 'equals' };
	create_date_start: { value: string | null; matchMode: 'equals' };
	create_date_end: { value: string | null; matchMode: 'equals' };
	is_deleted: { value: boolean; matchMode: 'equals' };
};

export const clientsDataTableFilters: ClientsDataTableFiltersType = {
	global: { value: null, matchMode: 'contains' },
	status: { value: null, matchMode: 'equals' },
	client_type: { value: null, matchMode: 'equals' },
	create_date_start: { value: null, matchMode: 'equals' },
	create_date_end: { value: null, matchMode: 'equals' },
	is_deleted: { value: false, matchMode: 'equals' },
};

export const dataSourceConfigClients = {
	dataTableState: {
		reloadTrigger: 0,
		first: 0,
		rows: 10,
		sortField: 'id',
		sortOrder: -1 as const,
		filters: clientsDataTableFilters,
	},
	dataTableColumns: [
		{
			field: 'id',
			header: 'ID',
			sortable: true,
			body: (
				entry: ClientModel,
				column: DataTableColumnType<ClientModel>,
			) =>
				DataTableValue(entry, column, {
					markDeleted: true,
					action: {
						name: 'view',
						source: 'clients',
					},
				}),
		},
		{
			field: 'client_type',
			header: 'Type',
			sortable: true,
			body: (
				entry: ClientModel,
				column: DataTableColumnType<ClientModel>,
			) =>
				DataTableValue(entry, column, {
					capitalize: true,
				}),
		},
		{
			field: 'name',
			header: 'Name',
			body: (
				entry: ClientModel,
				column: DataTableColumnType<ClientModel>,
			) =>
				DataTableValue(entry, column, {
					customValue: getClientDisplayName(entry),
				}),
		},
		{
			field: 'status',
			header: 'Status',
			body: (
				entry: ClientModel,
				column: DataTableColumnType<ClientModel>,
			) =>
				DataTableValue(entry, column, {
					isStatus: true,
					markDeleted: true,
					action: {
						name: (entry: ClientModel) => {
							return entry.deleted_at
								? 'restore'
								: entry.status === ClientStatusEnum.ACTIVE
									? 'disable'
									: 'enable';
						},
						source: 'clients',
					},
				}),
			style: {
				minWidth: '8rem',
				maxWidth: '8rem',
			},
		},
		{
			field: 'created_at',
			header: 'Created At',
			sortable: true,
			body: (
				entry: ClientModel,
				column: DataTableColumnType<ClientModel>,
			) =>
				DataTableValue(entry, column, {
					displayDate: true,
				}),
		},
	],
	formState: {
		dataSource: 'clients' as const,
		id: undefined,
		values: {
			client_type: ClientTypeEnum.COMPANY,
			company_name: null,
			company_cui: null,
			company_reg_com: null,
			iban: null,
			bank_name: null,
			address_location: null,
			address_country_id: null,
			address_region_id: null,
			city_id: null,
			details: null,
			postal_code: null,
			contact_name: null,
			contact_email: null,
			contact_phone: null,
			notes: null,
		},
		errors: {},
		message: null,
		situation: null,
	},
	functions: {
		find: findClients,
		getFormValues: getFormValuesClient,
		validateForm: (values: ClientFormValuesType) => {
			const validator = new ClientValidator(translationValidation);

			return validator.manage().safeParse(values);
		},
		syncFormState: (
			state: FormStateType<'clients', ClientModel, ClientFormValuesType>,
			model: ClientModel,
		): FormStateType<'clients', ClientModel, ClientFormValuesType> => {
			const base = {
				notes: model.notes,

				iban: model.iban,
				bank_name: model.bank_name,

				contact_name: model.contact_name,
				contact_email: model.contact_email,
				contact_phone: model.contact_phone,
			};

			if (model.client_type === ClientTypeEnum.COMPANY) {
				return {
					...state,
					id: model.id,
					values: {
						...base,
						client_type: ClientTypeEnum.COMPANY,

						company_name: model.company_name,
						company_cui: model.company_cui,
						company_reg_com: model.company_reg_com,
					},
				};
			}

			return {
				...state,
				id: model.id,
				values: {
					...base,
					client_type: ClientTypeEnum.PERSON,

					person_name: model.person_name,
					person_identification_number:
						model.person_identification_number,
				},
			};
		},
		displayActionEntries: (entries: ClientModel[]) => {
			return entries.map((entry) => ({
				id: entry.id,
				label: getClientDisplayName(entry),
			}));
		},
	},
	actions: {
		create: {
			mode: 'form' as const,
			permission: 'client.create',
			allowedEntries: 'free' as const,
			position: 'right' as const,
			function: createClient,
			buttonProps: {
				variant: 'info' as const,
			},
		},
		update: {
			mode: 'form' as const,
			permission: 'client.update',
			allowedEntries: 'single' as const,
			position: 'left' as const,
			function: updateClient,
			buttonProps: {
				variant: 'outline' as const,
				hover: 'success' as const,
			},
		},
		delete: {
			mode: 'action' as const,
			permission: 'client.delete',
			allowedEntries: 'single' as const,
			customEntryCheck: (entry: ClientModel) => !entry.deleted_at, // Return true if the entry is not deleted
			position: 'left' as const,
			function: deleteClient,
			buttonProps: {
				variant: 'outline' as const,
				hover: 'error' as const,
			},
		},
		enable: {
			mode: 'action' as const,
			permission: 'client.update',
			allowedEntries: 'single' as const,
			customEntryCheck: (entry: ClientModel) =>
				!entry.deleted_at &&
				[ClientStatusEnum.PENDING, ClientStatusEnum.INACTIVE].includes(
					entry.status,
				),
			position: 'left' as const,
			function: enableClient,
			buttonProps: {
				variant: 'outline' as const,
				hover: 'info' as const,
			},
		},
		disable: {
			mode: 'action' as const,
			permission: 'client.update',
			allowedEntries: 'single' as const,
			customEntryCheck: (entry: ClientModel) =>
				!entry.deleted_at &&
				[ClientStatusEnum.PENDING, ClientStatusEnum.ACTIVE].includes(
					entry.status,
				),
			position: 'left' as const,
			function: disableClient,
			buttonProps: {
				variant: 'outline' as const,
				hover: 'error' as const,
			},
		},
		restore: {
			mode: 'action' as const,
			permission: 'client.delete',
			allowedEntries: 'single' as const,
			customEntryCheck: (entry: ClientModel) => !!entry.deleted_at, // Return true if the entry is deleted
			position: 'left' as const,
			function: restoreClient,
			buttonProps: {
				variant: 'outline' as const,
				hover: 'info' as const,
			},
		},
		view: {
			mode: 'other' as const,
			permission: 'client.read',
			allowedEntries: 'single' as const,
			position: 'hidden' as const,
		},
	},
};
