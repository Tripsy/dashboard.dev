import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import {
	FormComponentAutoComplete,
	FormComponentInput,
	FormComponentRadio,
} from '@/components/form/form-element.component';
import { Icons } from '@/components/icon.component';
import { getLanguage } from '@/config/translate.setup';
import { toOptionsFromEnum } from '@/helpers/form.helper';
import { requestCreate, requestFind } from '@/helpers/services.helper';
import { formatEnumLabel } from '@/helpers/string.helper';
import { useElementIds } from '@/hooks/use-element-ids.hook';
import { useRemoteAutocomplete } from '@/hooks/use-remote-autocomplete';
import {
	type ClientModel,
	ClientTypeEnum,
	getClientDisplayName,
} from '@/models/client.model';
import {
	type ClientAddressFormValuesType,
	type ClientAddressType,
	ClientAddressTypeEnum,
} from '@/models/client-address.model';
import {
	CITY_DEFAULT,
	getPlaceContentProp,
	type PlaceModel,
	PlaceTypeEnum,
} from '@/models/place.model';
import { useWindowForm } from '@/providers/window-form.provider';
import { useModalStore } from '@/stores/window.store';
import type { FindFunctionResponseType } from '@/types/action.type';
import type { ApiResponseFetch } from '@/types/api.type';

const language = await getLanguage();
const addressTypes = toOptionsFromEnum(ClientAddressTypeEnum, {
	formatter: formatEnumLabel,
});

export function FormManageClientAddress() {
	const { formValues, errors, handleChange, pending } =
		useWindowForm<ClientAddressFormValuesType>();

	const { open, focus, getCurrentWindow } = useModalStore();

	const windowConfig = getCurrentWindow();

	const elementIds = useElementIds([
		'address_type',
		'client',
		'city',
		'details',
		'postal_code',
		'notes',
	] as const);

	const [searchClient, setSearchClient] = useState('');

	const { suggestions: clientSuggestions, isFetching: isClientFetching } =
		useRemoteAutocomplete<ClientModel>({
			query: searchClient,
			queryKey: ['s-client'],
			queryFn: async (q) => {
				const res: FindFunctionResponseType<ClientModel> | undefined =
					await requestFind('client', {
						filter: { term: q },
						limit: 10,
					});

				return res?.entries ?? [];
			},
			minLength: 3,
		});

	const [searchCity, setSearchCity] = useState('');

	const { suggestions: citySuggestions, isFetching: isCityFetching } =
		useRemoteAutocomplete<PlaceModel>({
			query: searchCity,
			queryKey: ['s-city'],
			queryFn: async (q) => {
				const res: FindFunctionResponseType<PlaceModel> | undefined =
					await requestFind('place', {
						filter: { term: q, place_type: PlaceTypeEnum.CITY },
						limit: 10,
					});

				return res?.entries ?? [];
			},
			minLength: 3,
		});

	const createCityMutation = useMutation({
		mutationFn: async (name: string) => {
			const res: ApiResponseFetch<Partial<PlaceModel>> =
				await requestCreate('place', {
					...CITY_DEFAULT,
					contents: [
						{
							...CITY_DEFAULT.contents[0],
							language,
							name,
						},
					],
				});

			return res?.data;
		},
	});

	return (
		<>
			<FormComponentRadio<ClientAddressFormValuesType>
				labelText="Address Type"
				id={elementIds.address_type}
				fieldName="address_type"
				fieldValue={formValues.address_type}
				options={addressTypes}
				disabled={pending}
				onChange={(value) =>
					handleChange('address_type', value as ClientAddressType)
				}
				error={errors.address_type}
			/>

			<input
				type="hidden"
				name="client_id"
				value={formValues.client_id ?? ''}
			/>

			{windowConfig?.action === 'create' && (
				<FormComponentAutoComplete<
					ClientAddressFormValuesType,
					ClientModel
				>
					labelText="Client"
					id={elementIds.client}
					fieldName="client"
					fieldValue={formValues.client ?? ''}
					className="pl-8"
					isRequired={true}
					disabled={pending}
					error={errors.client}
					onInputChange={(value) => {
						handleChange('client', value);
						handleChange('client_id', null);
						setSearchClient(value);
					}}
					autoCompleteProps={{
						suggestions: clientSuggestions,
						isLoading: isClientFetching,
						onSelect: (c) => {
							handleChange('client', getClientDisplayName(c));
							handleChange('client_id', c.id);
						},
						getOptionLabel: (c) => getClientDisplayName(c),
						getOptionKey: (c) => c.id,

						allowCreate: true,

						onCreate: (value) => {
							open<ClientModel>({
								section: 'dashboard',
								dataSource: 'client',
								action: 'create',
								minimized: false,
								data: {
									prefillEntry: {
										client_type: ClientTypeEnum.COMPANY,
										company_name: value,
									},
								},
								events: {
									success: (client?: ClientModel) => {
										if (!client) {
											return;
										}

										handleChange(
											'client',
											getClientDisplayName(client),
										);
										handleChange('client_id', client.id);

										// Back to client address form
										focus(windowConfig.uid);
									},
								},
								props: {
									size: 'x2l',
								},
							});
						},
						createLabel: (value) => `Create client "${value}"`,
					}}
					icons={{
						left: (
							<Icons.Client className="opacity-40 h-4.5 w-4.5" />
						),
					}}
				/>
			)}

			{windowConfig?.action === 'update' && (
				<input
					type="hidden"
					name="client"
					value={formValues.client ?? ''}
				/>
			)}

			<input
				type="hidden"
				name="city_id"
				value={formValues.city_id ?? ''}
			/>
			<FormComponentAutoComplete<ClientAddressFormValuesType, PlaceModel>
				labelText="City"
				id={elementIds.city}
				fieldName="city"
				fieldValue={formValues.city ?? ''}
				className="pl-8"
				isRequired={false}
				disabled={pending}
				error={errors.city}
				onInputChange={(value) => {
					handleChange('city', value);
					handleChange('city_id', null);
					setSearchCity(value);
				}}
				autoCompleteProps={{
					suggestions: citySuggestions,
					isLoading: isCityFetching,
					onSelect: (c) => {
						handleChange('city', getPlaceContentProp(c, language));
						handleChange('city_id', c.id);
					},
					getOptionLabel: (c) => getPlaceContentProp(c, language),
					getOptionKey: (c) => c.id,

					allowCreate: true,

					onCreate: async (value) => {
						const newCity =
							await createCityMutation.mutateAsync(value);

						if (!newCity) {
							return;
						}

						handleChange('city', value);
						handleChange('city_id', newCity.id as number);
					},

					createLabel: (value) => `Create city "${value}"`,
				}}
				icons={{
					left: <Icons.City className="opacity-40 h-4.5 w-4.5" />,
				}}
			/>

			<FormComponentInput<ClientAddressFormValuesType>
				labelText="Details"
				id={elementIds.details}
				fieldName="details"
				fieldValue={formValues.details ?? ''}
				isRequired={true}
				placeholderText="e.g.: Str Victoriei 15"
				disabled={pending}
				onChange={(e) => handleChange('details', e.target.value)}
				error={errors.details}
			/>

			<FormComponentInput<ClientAddressFormValuesType>
				labelText="Postal Code"
				id={elementIds.postal_code}
				fieldName="postal_code"
				fieldValue={formValues.postal_code ?? ''}
				placeholderText="e.g.: 067895"
				disabled={pending}
				onChange={(e) => handleChange('postal_code', e.target.value)}
				error={errors.postal_code}
			/>

			<FormComponentInput<ClientAddressFormValuesType>
				labelText="Notes"
				id={elementIds.notes}
				fieldName="notes"
				fieldValue={formValues.notes ?? ''}
				placeholderText="e.g.: Beware of the big dog"
				disabled={pending}
				onChange={(e) => handleChange('notes', e.target.value)}
				error={errors.notes}
			/>
		</>
	);
}
