import { z } from 'zod';
import {
	type DataTableColumnType,
	DataTableValue,
} from '@/app/(dashboard)/_components/data-table-value';
import { FormManageClientAddress } from '@/app/(dashboard)/dashboard/client-address/form-manage-client-address.component';
import { ViewClientAddress } from '@/app/(dashboard)/dashboard/client-address/view-client-address.component';
import type { FormStateType } from '@/config/data-source.config';
import {
	getFormDataAsEnum,
	getFormDataAsNumber,
	getFormDataAsString,
} from '@/helpers/form.helper';
import { BaseValidator } from '@/helpers/validator.helper';
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

const validatorMessages = await BaseValidator.getValidatorMessages(
	[
		'invalid_client_id',
		'invalid_client',
		'invalid_address_type',
		'invalid_city_id',
		'invalid_city',
		'invalid_details',
		'invalid_postal_code',
		'invalid_notes',
	] as const,
	'client-address.validation',
);

class ClientAddressValidator extends BaseValidator<typeof validatorMessages> {
	manage = z
		.object({
			client_id: this.validateId(this.getMessage('invalid_client_id')),
			client: this.validateString(this.getMessage('invalid_client')),
			address_type: this.validateEnum(
				ClientAddressTypeEnum,
				this.getMessage('invalid_address_type'),
			),
			city_id: this.validateId(this.getMessage('invalid_city_id'), {
				required: false,
			}),
			city: this.validateString(this.getMessage('invalid_city'), {
				required: false,
			}),
			details: this.validateString(this.getMessage('invalid_details')),
			postal_code: this.validatePostalCode(
				this.getMessage('invalid_postal_code'),
				{
					required: false,
				},
			),
			notes: this.validateString(this.getMessage('invalid_notes'), {
				required: false,
			}),
		})
		.superRefine((data, ctx) => {
			if (data.city && !data.city_id) {
				ctx.addIssue({
					path: ['city'],
					message: this.getMessage('invalid_city'),
					code: 'custom',
				});
			}
		});
}

function getFormValuesClientAddress(
	formData: FormData,
): ClientAddressFormValuesType {
	return {
		client_id: getFormDataAsNumber(formData, 'client_id'),
		client: getFormDataAsString(formData, 'client'),
		address_type:
			getFormDataAsEnum(
				formData,
				'address_type',
				ClientAddressTypeEnum,
			) || ClientAddressTypeEnum.DELIVERY,
		city_id: getFormDataAsNumber(formData, 'city_id'),
		city: getFormDataAsString(formData, 'city'),
		details: getFormDataAsString(formData, 'details'),
		postal_code: getFormDataAsString(formData, 'postal_code'),
		notes: getFormDataAsString(formData, 'notes'),
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
			field: 'details',
			header: 'Address',
			sortable: true,
		},
	],
	formState: {
		dataSource: 'client-address' as const,
		id: undefined,
		values: {
			client_id: null,
			client: null,
			address_type: ClientAddressTypeEnum.DELIVERY,
			city_id: null,
			city: null,
			details: null,
			postal_code: null,
			notes: null,
		},
		errors: {},
		message: null,
		situation: null,
	},
	functions: {
		find: findClientAddress,
		getFormValues: getFormValuesClientAddress,
		validateForm: (values: ClientAddressFormValuesType) => {
			const validator = new ClientAddressValidator(validatorMessages);

			return validator.manage.safeParse(values);
		},
		getFormState: (
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
					city_id: model.city_id,
					details: model.details,
					postal_code: model.postal_code,
					notes: model.notes,
				},
			};
		},
		displayActionEntries: (entries: ClientAddressModel[]) => {
			return entries.map((entry) => ({
				id: entry.id,
				label: entry.details,
			}));
		},
	},
	actions: {
		create: {
			component: FormManageClientAddress,
			windowType: 'form' as const,
			permission: 'client-address.create',
			entriesSelection: 'free' as const,
			buttonPosition: 'right' as const,
			operationFunction: createClientAddress,
			button: {
				variant: 'info' as const,
			},
		},
		update: {
			component: FormManageClientAddress,
			windowType: 'form' as const,
			permission: 'client-address.update',
			entriesSelection: 'single' as const,
			buttonPosition: 'left' as const,
			operationFunction: updateClientAddress,
			button: {
				variant: 'outline' as const,
				hover: 'success' as const,
			},
		},
		delete: {
			windowType: 'action' as const,
			permission: 'client-address.delete',
			entriesSelection: 'single' as const,
			customEntryCheck: (entry: ClientAddressModel) => !entry.deleted_at, // Return true if the entry is not deleted
			buttonPosition: 'left' as const,
			operationFunction: deleteClientAddress,
			button: {
				variant: 'outline' as const,
				hover: 'error' as const,
			},
		},
		restore: {
			windowType: 'action' as const,
			permission: 'client-address.delete',
			entriesSelection: 'single' as const,
			customEntryCheck: (entry: ClientAddressModel) => !!entry.deleted_at, // Return true if the entry is deleted
			buttonPosition: 'left' as const,
			operationFunction: restoreClientAddress,
			button: {
				variant: 'outline' as const,
				hover: 'info' as const,
			},
		},
		view: {
			windowType: 'view' as const,
			component: ViewClientAddress,
			permission: 'client-address.read',
			entriesSelection: 'single' as const,
			buttonPosition: 'hidden' as const,
		},
		// createClient: {
		// 	windowType: 'form' as const,
		// 	permission: 'client.create',
		// 	entriesSelection: 'free' as const,
		// 	buttonPosition: 'hidden' as const,
		// 	button: {
		// 		icon: 'create',
		// 	},
		// },
	},
};
