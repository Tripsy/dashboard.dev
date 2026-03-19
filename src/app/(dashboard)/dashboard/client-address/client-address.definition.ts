import { z } from 'zod';
import {
	type DataTableColumnType,
	DataTableValue,
} from '@/app/(dashboard)/_components/data-table-value';
import type { FormStateType } from '@/config/data-source.config';
import { translateBatch } from '@/config/translate.setup';
import {
	isValidPostalCode,
	validateEnum,
	validateId,
	validateString,
} from '@/helpers/form.helper';
import { getClientDisplayName } from '@/models/client.model';
import {
	type ClientAddressFormValuesType,
	type ClientAddressModel,
	ClientAddressTypeEnum,
} from '@/models/client-address.model';
import {
	createClientAddress,
	deleteClientAddress,
	findClientAddress,
	restoreClientAddress,
	updateClientAddress,
} from '@/services/client-address.service';

const translations = await translateBatch([
	'client-address.validation.address_client_id_invalid',
	'client-address.validation.address_type_invalid',
	'client-address.validation.address_city_id_invalid',
	'client-address.validation.address_info_invalid',
	'client-address.validation.address_postal_code_invalid',
	'client-address.validation.notes_invalid',
]);

const ValidateSchemaBaseClientAddress = z.object({
	client_id: validateId(
		translations['client-address.validation.address_client_id_invalid'],
	),
	address_type: validateEnum(
		ClientAddressTypeEnum,
		translations['client-address.validation.address_type_invalid'],
	),
	address_city_id: validateId(
		translations['client-address.validation.address_city_id_invalid'],
	).optional(),
	address_info: validateString(
		translations['client-address.validation.address_info_invalid'],
	),
	address_postal_code: z
		.string()
		.nullable()
		.refine(
			(val) => {
				if (val === null || val === '') {
					return true;
				}

				return isValidPostalCode(val);
			},
			{
				message:
					translations[
						'client-address.validation.address_postal_code_invalid'
					],
			},
		),
	notes: validateString(
		translations['client-address.validation.notes_invalid'],
	).optional(),
});

function getFormValuesClientAddress(
	formData: FormData,
): ClientAddressFormValuesType {
	const address_type = formData.get(
		'address_type',
	) as ClientAddressTypeEnum | null;

	return {
		client_id: Number(formData.get('client_id')),
		address_type:
			address_type &&
			Object.values(ClientAddressTypeEnum).includes(address_type)
				? address_type
				: ClientAddressTypeEnum.DELIVERY,
		address_city_id: formData.get('address_city_id')
			? Number(formData.get('address_city_id'))
			: null,
		address_info: formData.get('address_info') as string,
		address_postal_code: formData.get('address_postal_code') as
			| string
			| null,
		notes: formData.get('notes') as string | null,
	};
}

export type ClientAddressDataTableFiltersType = {
	global: { value: string | null; matchMode: 'contains' };
	address_type: { value: ClientAddressTypeEnum | null; matchMode: 'equals' };
	is_deleted: { value: boolean; matchMode: 'equals' };
};

export const clientAddressDataTableFilters: ClientAddressDataTableFiltersType =
	{
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
			header: 'ID',
			sortable: true,
			body: (
				entry: ClientAddressModel,
				column: DataTableColumnType<ClientAddressModel>,
			) =>
				DataTableValue(entry, column, {
					markDeleted: true,
					action: {
						name: 'view',
						source: 'client-address',
					},
				}),
		},
		{
			field: 'client',
			header: 'Client',
			body: (
				entry: ClientAddressModel,
				column: DataTableColumnType<ClientAddressModel>,
			) =>
				DataTableValue(entry, column, {
					customValue: getClientDisplayName(entry.client),
				}),
		},
		{
			field: 'address_type',
			header: 'Type',
			body: (
				entry: ClientAddressModel,
				column: DataTableColumnType<ClientAddressModel>,
			) =>
				DataTableValue(entry, column, {
					capitalize: true,
				}),
		},
		{
			field: 'city',
			header: 'City',
			body: (
				entry: ClientAddressModel,
				column: DataTableColumnType<ClientAddressModel>,
			) =>
				DataTableValue(entry, column, {
					customValue: entry.city?.code || '',
				}),
		},
		{
			field: 'address_info',
			header: 'Address',
			sortable: true,
		},
	],
	formState: {
		dataSource: 'client-address' as const,
		id: undefined,
		values: {
			client_id: null,
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
		validateForm: (values: ClientAddressFormValuesType) => {
			return ValidateSchemaBaseClientAddress.safeParse(values);
		},
		syncFormState: (
			state: FormStateType<
				'client-address',
				ClientAddressModel,
				ClientAddressFormValuesType
			>,
			model: ClientAddressModel,
		): FormStateType<
			'client-address',
			ClientAddressModel,
			ClientAddressFormValuesType
		> => {
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
