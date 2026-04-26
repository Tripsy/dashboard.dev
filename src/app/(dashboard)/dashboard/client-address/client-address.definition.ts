import { z } from 'zod';
import { DataTableValue } from '@/app/(dashboard)/_components/data-table-value';
import { FormManageClientAddress } from '@/app/(dashboard)/dashboard/client-address/form-manage-client-address.component';
import { ViewClientAddress } from '@/app/(dashboard)/dashboard/client-address/view-client-address.component';
import type {
	DataSourceConfigType,
	DataTableColumnType,
	DataTableValueOptionsType,
} from '@/config/data-source.config';
import { translateBatch } from '@/config/translate.setup';
import {
	getFormDataAsEnum,
	getFormDataAsNumber,
	getFormDataAsString,
} from '@/helpers/form.helper';
import { requestFind } from '@/helpers/services.helper';
import { BaseValidator } from '@/helpers/validator.helper';
import { getClientDisplayName } from '@/models/client.model';
import {
	type ClientAddressFormValuesType,
	type ClientAddressModel,
	type ClientAddressType,
	ClientAddressTypeEnum,
} from '@/models/client-address.model';
import { getPlaceContentProp } from '@/models/place.model';
import {
	createClientAddress,
	deleteClientAddress,
	restoreClientAddress,
	updateClientAddress,
} from '@/services/client-address.service';
import type { FindFunctionParamsType } from '@/types/action.type';
import type { FormStateType } from '@/types/form.type';

const translations = await translateBatch(
	[
		'create.title',
		'update.title',
		'delete.title',
		'restore.title',
		'view.title',
		'viewClient.label',
	] as const,
	'client-address.action',
);

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
	manage = (isSubmit: boolean = true) =>
		z
			.object({
				client_id: this.validateId(
					this.getMessage('invalid_client_id'),
					{
						required: false,
					},
				),
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
				details: this.validateString(
					this.getMessage('invalid_details'),
				),
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
				if (isSubmit && data.client && !data.client_id) {
					ctx.addIssue({
						path: ['client'],
						message: this.getMessage('invalid_client_id'),
						code: 'custom',
					});
				}

				if (isSubmit && data.city && !data.city_id) {
					ctx.addIssue({
						path: ['city'],
						message: this.getMessage('invalid_city_id'),
						code: 'custom',
					});
				}
			});
}

function validateForm(
	values: ClientAddressFormValuesType,
	isSubmit: boolean = true,
) {
	const validator = new ClientAddressValidator(validatorMessages);

	return validator.manage(isSubmit).safeParse(values);
}

function getFormValues(formData: FormData): ClientAddressFormValuesType {
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

function getFormState(
	data?: ClientAddressModel,
): FormStateType<ClientAddressFormValuesType> {
	return {
		errors: {},
		message: null,
		situation: null,
		values: {
			client_id: data?.client.id ?? null,
			client: data?.client ? getClientDisplayName(data?.client) : null,
			address_type: data?.address_type ?? ClientAddressTypeEnum.DELIVERY,
			city_id: data?.city?.id ?? null,
			city: data?.city ? getPlaceContentProp(data?.city, 'name') : null,
			details: data?.details ?? null,
			postal_code: data?.postal_code ?? null,
			notes: data?.notes ?? null,
		},
	};
}

export type ClientAddressDataTableFiltersType = {
	global: { value: string | null; matchMode: 'contains' };
	address_type: { value: ClientAddressType | null; matchMode: 'equals' };
	is_deleted: { value: boolean; matchMode: 'equals' };
};

export const clientAddressDataTableFilters: ClientAddressDataTableFiltersType =
	{
		global: { value: null, matchMode: 'contains' },
		address_type: { value: null, matchMode: 'equals' },
		is_deleted: { value: false, matchMode: 'equals' },
	};

function displayButtonViewClient(
	entry: ClientAddressModel,
): DataTableValueOptionsType<ClientAddressModel>['displayButton'] {
	if (!entry.client) {
		return undefined;
	}

	return {
		action: 'view',
		dataSource: 'clients',
		altTitle: translations['viewClient.label'],
		alternateEntryId: entry.client.id,
	};
}

export const dataSourceConfigClientAddress: DataSourceConfigType<
	ClientAddressModel,
	ClientAddressFormValuesType
> = {
	dataTable: {
		state: {
			first: 0,
			rows: 10,
			sortField: 'id',
			sortOrder: -1 as const,
			filters: clientAddressDataTableFilters,
		},
		columns: [
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
						displayButton: {
							action: 'view',
							dataSource: 'client-address',
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
						displayButton: displayButtonViewClient(entry),
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
						customValue: entry.city
							? getPlaceContentProp(entry.city, 'name')
							: undefined,
					}),
			},
			{
				field: 'details',
				header: 'Address',
				sortable: true,
			},
		],
		find: (params: FindFunctionParamsType) =>
			requestFind<ClientAddressModel>('client-address', params),
	},
	displayEntryLabel: (entry: ClientAddressModel) => {
		return `${getClientDisplayName(entry.client)} - ${entry.details}`;
	},
	actions: {
		create: {
			windowType: 'form',
			windowTitle: translations['create.title'],
			windowComponent: FormManageClientAddress,
			permission: 'client-address.create',
			entriesSelection: 'free',
			operationFunction: (params: ClientAddressFormValuesType) => {
				const { client_id, client, city, ...prepareParams } = params;

				return createClientAddress(client_id, prepareParams);
			},
			buttonPosition: 'right',
			button: {
				variant: 'info',
			},
			getFormValues: getFormValues,
			validateForm: validateForm,
			getFormState: getFormState,
		},
		update: {
			windowType: 'form',
			windowTitle: translations['update.title'],
			windowComponent: FormManageClientAddress,
			permission: 'client-address.update',
			entriesSelection: 'single',
			operationFunction: (
				params: ClientAddressFormValuesType,
				id: number,
			) => {
				const { client_id, client, city, ...prepareParams } = params;

				return updateClientAddress(client_id, prepareParams, id);
			},
			buttonPosition: 'left',
			button: {
				variant: 'outline',
				hover: 'success',
			},
			getFormValues: getFormValues,
			validateForm: validateForm,
			getFormState: getFormState,
		},
		delete: {
			windowType: 'action',
			windowTitle: translations['delete.title'],
			permission: 'client-address.delete',
			entriesSelection: 'single',
			customEntryCheck: (entry: ClientAddressModel) => !entry.deleted_at, // Return true if the entry is not deleted
			operationFunction: (entry: ClientAddressModel) =>
				deleteClientAddress(entry),
			buttonPosition: 'left',
			button: {
				variant: 'outline',
				hover: 'error',
			},
		},
		restore: {
			windowType: 'action',
			windowTitle: translations['restore.title'],
			permission: 'client-address.delete',
			entriesSelection: 'single',
			customEntryCheck: (entry: ClientAddressModel) => !!entry.deleted_at, // Return true if the entry is deleted
			operationFunction: (entry: ClientAddressModel) =>
				restoreClientAddress(entry),
			buttonPosition: 'left',
			button: {
				variant: 'outline',
				hover: 'info',
			},
		},
		view: {
			windowType: 'view',
			windowTitle: translations['view.title'],
			windowComponent: ViewClientAddress,
			permission: 'client-address.read',
			entriesSelection: 'single',
			buttonPosition: 'hidden',
		},
	},
};
