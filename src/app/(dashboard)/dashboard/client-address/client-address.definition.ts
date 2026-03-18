import { z } from 'zod';
import {
	type DataTableColumnType,
	DataTableValue,
} from '@/app/(dashboard)/_components/data-table-value';
import type { FormStateType } from '@/config/data-source.config';
import { Configuration } from '@/config/settings.config';
import { translateBatch } from '@/config/translate.setup';
import {
	type ClientAddressFormValuesType,
	type ClientAddressModel, ClientAddressTypeEnum,
} from '@/models/client-address.model';
import {
	createClientAddress,
	updateClientAddress,
	deleteClientAddress,
	findClientAddress,
	restoreClientAddress,
} from '@/services/client-address.service';

const translations = await translateBatch([
	'client-address.validation.name_invalid',
	{
		key: 'client-address.validation.name_min',
		vars: {
			min: Configuration.get('client-address.nameMinLength') as string,
		},
	},
	'client-address.validation.email_invalid',
	'client-address.validation.language_invalid',
	'client-address.validation.role_invalid',
	{
		key: 'client-address.validation.password_invalid',
		vars: {
			min: Configuration.get('client-address.passwordMinLength') as string,
		},
	},
	{
		key: 'client-address.validation.password_min',
		vars: {
			min: Configuration.get('client-address.passwordMinLength') as string,
		},
	},
	'client-address.validation.password_condition_capital_letter',
	'client-address.validation.password_condition_number',
	'client-address.validation.password_condition_special_character',
	'client-address.validation.password_confirm_required',
	'client-address.validation.password_confirm_mismatch',
	'client-address.validation.operator_type_invalid',
	'client-address.data_table.column_id',
	'client-address.data_table.column_name',
	'client-address.data_table.column_email',
	'client-address.data_table.column_role',
	'client-address.data_table.column_status',
	'client-address.data_table.column_created_at',
]);

const ValidateSchemaBaseClientAddress = z.object({
	client_id: z.number({ message: translations['client-address.validation.address_client_id_invalid'] }),
	address_type: z.enum(
		ClientAddressTypeEnum,
		translations['client-address.validation.address_type_invalid']
	),
	address_city_id: z.number({ message: translations['client-address.validation.address_city_id_invalid'] }).optional(),
	address_info: z.string({ message: translations['client-address.validation.address_info_invalid'] }),
	address_postal_code: z
		.string()
		.regex(/^\d{6}$/, translations['client-address.validation.address_postal_code_invalid'])
		.optional(),
	notes: z.string({ message: translations['client-address.validation.notes_invalid'] }).optional(),
});

function getFormValuesClientAddress(formData: FormData): ClientAddressFormValuesType {
	const address_type = formData.get('address_type') as ClientAddressTypeEnum | null;

	return {
		client_id: Number(formData.get('client_id')),
		address_type: address_type && Object.values(ClientAddressTypeEnum).includes(address_type)
			? address_type
			: ClientAddressTypeEnum.DELIVERY,
		address_city_id: formData.get('address_city_id')
			? Number(formData.get('address_city_id'))
			: null,
		address_info: formData.get('address_info') as string,
		address_postal_code: formData.get('address_postal_code') as string | null,
		notes: formData.get('notes') as string | null,
	};
}

export type ClientAddressDataTableFiltersType = {
	global: { value: string | null; matchMode: 'contains' };
	address_type: { value: ClientAddressTypeEnum | null; matchMode: 'equals' };
	is_deleted: { value: boolean; matchMode: 'equals' };
};

export const clientAddressDataTableFilters: ClientAddressDataTableFiltersType = {
	global: { value: null, matchMode: 'contains' },
	address_type: { value: null, matchMode: 'equals' },
	is_deleted: { value: false, matchMode: 'equals' },
};

export const dataSourceConfigClientAddress = {
	dataTableState: {
		reloadTrigger: 0,
		first: 0,
		rows: 10,
		sortField: 'id',
		sortOrder: -1 as const,
		filters: clientAddressDataTableFilters,
	},
	dataTableColumns: [
		{
			field: 'id',
			header: translations['client-address.data_table.column_id'],
			sortable: true,
			body: (entry: ClientAddressModel, column: DataTableColumnType<ClientAddressModel>) =>
				DataTableValue(entry, column, {
					markDeleted: true,
					action: {
						name: 'view',
						source: 'client-address',
					},
				}),
		},
		{
			field: 'address_type',
			header: translations['client-address.data_table.column_address_type'],
			body: (entry: ClientAddressModel, column: DataTableColumnType<ClientAddressModel>) =>
				DataTableValue(entry, column, {
					capitalize: true,
				}),
		},
		{
			field: 'address-info',
			header: translations['client-address.data_table.column_address_info'],
			sortable: true,
		},
		// {
		// 	field: 'email',
		// 	header: translations['client-address.data_table.column_email'],
		// },
		{
			field: 'created_at',
			header: translations['client-address.data_table.column_created_at'],
			sortable: true,
			body: (entry: ClientAddressModel, column: DataTableColumnType<ClientAddressModel>) =>
				DataTableValue(entry, column, {
					displayDate: true,
				}),
		},
	],
	formState: {
		dataSource: 'client-address' as const,
		id: undefined,
		values: {
			client_id: '',
			address_type: ClientAddressTypeEnum.BILLING,
			address_city_id: null,
			address_info: '',
			address_postal_code: '',
			notes: '',
		},
		errors: {},
		message: null,
		situation: null,
	},
	functions: {
		find: findClientAddress,
		getFormValues: getFormValuesClientAddress,
		validateForm: (values: ClientAddressFormValuesType, id?: number) => {
			return ValidateSchemaBaseClientAddress.safeParse(values);
		},
		syncFormState: (
			state: FormStateType<'client-address', ClientAddressModel, ClientAddressFormValuesType>,
			model: ClientAddressModel,
		): FormStateType<'client-address', ClientAddressModel, ClientAddressFormValuesType> => {
			return {
				...state,
				id: model.id,
				values: {
					...state.values,
					client_id: model.client_id,
					address_type: model.address_type,
					address_city_id: model.address_city_id,
					address_info: model.address_info,
					address_postal_code: model.address_postal_code,
					notes: model.notes,
				},
			};
		},
		displayActionEntries: (entries: ClientAddressModel[]) => {
			return entries.map((entry) => ({
				id: entry.id,
				label: entry.address_info,
			}));
		},
	},
	actions: {
		create: {
			mode: 'form' as const,
			permission: 'client-address.create',
			allowedEntries: 'free' as const,
			position: 'right' as const,
			function: createClientAddress,
			buttonProps: {
				variant: 'info' as const,
			},
		},
		update: {
			mode: 'form' as const,
			permission: 'client-address.update',
			allowedEntries: 'single' as const,
			position: 'left' as const,
			function: updateClientAddress,
			buttonProps: {
				variant: 'outline' as const,
				hover: 'success' as const,
			},
		},
		delete: {
			mode: 'action' as const,
			permission: 'client-address.delete',
			allowedEntries: 'single' as const,
			customEntryCheck: (entry: ClientAddressModel) => !entry.deleted_at, // Return true if the entry is not deleted
			position: 'left' as const,
			function: deleteClientAddress,
			buttonProps: {
				variant: 'outline' as const,
				hover: 'error' as const,
			},
		},
		restore: {
			mode: 'action' as const,
			permission: 'client-address.delete',
			allowedEntries: 'single' as const,
			customEntryCheck: (entry: ClientAddressModel) => !!entry.deleted_at, // Return true if the entry is deleted
			position: 'left' as const,
			function: restoreClientAddress,
			buttonProps: {
				variant: 'outline' as const,
				hover: 'info' as const,
			},
		},
		view: {
			mode: 'other' as const,
			permission: 'client-address.read',
			allowedEntries: 'single' as const,
			position: 'hidden' as const,
		},
	},
};
