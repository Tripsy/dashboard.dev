import { z } from 'zod';
import {
	type DataTableColumnType,
	DataTableValue,
} from '@/app/(dashboard)/_components/data-table-value';
import { FormManageClient } from '@/app/(dashboard)/dashboard/clients/form-manage-client.component';
import { ViewClient } from '@/app/(dashboard)/dashboard/clients/view-client.component';
import type { FormStateType } from '@/config/data-source.config';
import { getFormDataAsEnum, getFormDataAsString } from '@/helpers/form.helper';
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

const validatorMessages = await BaseValidator.getValidatorMessages(
	[
		'invalid_client_type',
		'invalid_iban',
		'invalid_bank_name',
		'invalid_contact_name',
		'invalid_contact_email',
		'invalid_contact_phone',
		'invalid_notes',
		'invalid_company_name',
		'invalid_company_cui',
		'invalid_company_reg_com',
		'invalid_person_name',
		'invalid_person_identification_number',
	],
	'clients.validation',
);

class ClientValidator extends BaseValidator<typeof validatorMessages> {
	baseSchema = {
		iban: this.validateIBAN(this.getMessage('invalid_iban'), {
			required: false,
		}),
		bank_name: this.validateString(this.getMessage('invalid_bank_name'), {
			required: false,
		}),
		contact_name: this.validateString(
			this.getMessage('invalid_contact_name'),
			{
				required: false,
			},
		),
		contact_email: this.validateEmail(
			this.getMessage('invalid_contact_email'),
			{
				required: false,
			},
		),
		contact_phone: this.validatePhone(
			this.getMessage('invalid_contact_phone'),
			{
				required: false,
			},
		),
		notes: this.validateString(this.getMessage('invalid_notes'), {
			required: false,
		}),
	};

	manage = z.discriminatedUnion('client_type', [
		// Company schema
		z
			.object({
				client_type: z.literal(ClientTypeEnum.COMPANY),
				company_name: this.validateString(
					this.getMessage('invalid_company_name'),
				),
				company_cui: this.validateString(
					this.getMessage('invalid_company_cui'),
				),
				company_reg_com: this.validateString(
					this.getMessage('invalid_company_reg_com'),
					{
						required: false,
					},
				),
				person_name: z.never().optional(),
				person_identification_number: z.never().optional(),
			})
			.extend(this.baseSchema),

		// Person schema
		z
			.object({
				client_type: z.literal(ClientTypeEnum.PERSON),
				company_name: z.never().optional(),
				company_cui: z.never().optional(),
				company_reg_com: z.never().optional(),
				person_name: this.validateString(
					this.getMessage('invalid_person_name'),
				),
				person_identification_number:
					this.validatePersonalIdentificationNumber(
						this.getMessage('invalid_person_identification_number'),
						{
							required: false,
						},
					),
			})
			.extend(this.baseSchema),
	]);
}

export function getFormValuesClient(formData: FormData): ClientFormValuesType {
	const client_type =
		getFormDataAsEnum(formData, 'client_type', ClientTypeEnum) ||
		ClientTypeEnum.COMPANY;

	const base = {
		notes: getFormDataAsString(formData, 'notes'),

		iban: getFormDataAsString(formData, 'iban'),
		bank_name: getFormDataAsString(formData, 'bank_name'),

		contact_name: getFormDataAsString(formData, 'contact_name'),
		contact_email: getFormDataAsString(formData, 'contact_email'),
		contact_phone: getFormDataAsString(formData, 'contact_phone'),
	};

	if (client_type === ClientTypeEnum.COMPANY) {
		return {
			...base,
			client_type: ClientTypeEnum.COMPANY,

			company_name: getFormDataAsString(formData, 'company_name'),
			company_cui: getFormDataAsString(formData, 'company_cui'),
			company_reg_com: getFormDataAsString(formData, 'company_reg_com'),
		};
	}

	return {
		...base,
		client_type: ClientTypeEnum.PERSON,

		person_name: getFormDataAsString(formData, 'person_name'),
		person_identification_number: getFormDataAsString(
			formData,
			'person_identification_number',
		),
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
			const validator = new ClientValidator(validatorMessages);

			return validator.manage.safeParse(values);
		},
		getFormState: (
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
			windowType: 'form' as const,
			component: FormManageClient,
			modalProps: {
				size: 'x2l' as const,
			},
			permission: 'client.create',
			entriesSelection: 'free' as const,
			actionPosition: 'right' as const,
			operationFunction: createClient,
			button: {
				variant: 'info' as const,
			},
		},
		update: {
			windowType: 'form' as const,
			component: FormManageClient,
			modalProps: {
				size: 'x2l' as const,
			},
			permission: 'client.update',
			entriesSelection: 'single' as const,
			actionPosition: 'left' as const,
			operationFunction: updateClient,
			button: {
				variant: 'outline' as const,
				hover: 'success' as const,
			},
		},
		delete: {
			windowType: 'action' as const,
			permission: 'client.delete',
			entriesSelection: 'single' as const,
			customEntryCheck: (entry: ClientModel) => !entry.deleted_at, // Return true if the entry is not deleted
			actionPosition: 'left' as const,
			operationFunction: deleteClient,
			button: {
				variant: 'outline' as const,
				hover: 'error' as const,
			},
		},
		enable: {
			windowType: 'action' as const,
			permission: 'client.update',
			entriesSelection: 'single' as const,
			customEntryCheck: (entry: ClientModel) =>
				!entry.deleted_at &&
				[ClientStatusEnum.PENDING, ClientStatusEnum.INACTIVE].includes(
					entry.status,
				),
			actionPosition: 'left' as const,
			operationFunction: enableClient,
			button: {
				variant: 'outline' as const,
				hover: 'info' as const,
			},
		},
		disable: {
			windowType: 'action' as const,
			permission: 'client.update',
			entriesSelection: 'single' as const,
			customEntryCheck: (entry: ClientModel) =>
				!entry.deleted_at &&
				[ClientStatusEnum.PENDING, ClientStatusEnum.ACTIVE].includes(
					entry.status,
				),
			actionPosition: 'left' as const,
			operationFunction: disableClient,
			button: {
				variant: 'outline' as const,
				hover: 'error' as const,
			},
		},
		restore: {
			windowType: 'action' as const,
			permission: 'client.delete',
			entriesSelection: 'single' as const,
			customEntryCheck: (entry: ClientModel) => !!entry.deleted_at, // Return true if the entry is deleted
			actionPosition: 'left' as const,
			operationFunction: restoreClient,
			button: {
				variant: 'outline' as const,
				hover: 'info' as const,
			},
		},
		view: {
			windowType: 'view' as const,
			component: ViewClient,
			modalProps: {
				size: 'x4l' as const,
			},
			permission: 'client.read',
			entriesSelection: 'single' as const,
			actionPosition: 'hidden' as const,
		},
	},
};
