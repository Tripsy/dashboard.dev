import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import {
	FormComponentAutoComplete,
	FormComponentInput,
	FormComponentRadio,
} from '@/components/form/form-element.component';
import { Icons } from '@/components/icon.component';
import type { FormManageType } from '@/config/data-source.config';
import { getLanguage } from '@/config/translate.setup';
import { toOptionsFromEnum } from '@/helpers/form.helper';
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
	ClientAddressTypeEnum,
} from '@/models/client-address.model';
import {
	CITY_DEFAULT,
	getPlaceContentProp,
	type PlaceModel,
	PlaceTypeEnum,
} from '@/models/place.model';
import { findClients } from '@/services/clients.service';
import { createPlace, findPlaces } from '@/services/places.service';

const language = await getLanguage();
const addressTypes = toOptionsFromEnum(ClientAddressTypeEnum, {
	formatter: formatEnumLabel,
});

export function FormManageClientAddress({
	formValues,
	errors,
	handleChange,
	pending,
}: FormManageType<ClientAddressFormValuesType>) {
	const elementIds = useElementIds([
		'address_type',
		'client',
		'city',
		'details',
		'postal_code',
		'notes',
	] as const);

	const [searchCity, setSearchCity] = useState('');

	const { suggestions: cities, isFetching: isCityLoading } =
		useRemoteAutocomplete<PlaceModel>({
			query: searchCity,
			queryKey: ['cities'],
			queryFn: async (q) => {
				const res = await findPlaces({
					filter: { term: q, place_type: PlaceTypeEnum.CITY },
					limit: 10,
				});

				return res?.entries ?? [];
			},
			minLength: 3,
		});

	const createCityMutation = useMutation({
		mutationFn: async (name: string) => {
			const res = await createPlace({
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

	const [searchClient, setSearchClient] = useState('');

	const { suggestions: clients, isFetching: isClientLoading } =
		useRemoteAutocomplete<ClientModel>({
			query: searchClient,
			queryKey: ['clients'],
			queryFn: async (q) => {
				const res = await findClients({
					filter: { term: q },
					limit: 10,
				});

				return res?.entries ?? [];
			},
			minLength: 3,
		});

	// useEffect(() => {
	// 	const onNewClient = (ev: Event) => {
	// 		const { client } = (ev as CustomEvent<ClientAddressNewClientCreatedDetail>)
	// 			.detail;
	// 		const id = client?.id;
	//
	// 		if (id == null) {
	// 			return;
	// 		}
	//
	// 		const label =
	// 			client.client_type === ClientTypeEnum.COMPANY ||
	// 			client.client_type === ClientTypeEnum.PERSON
	// 				? getClientDisplayName(client as ClientModel)
	// 				: (client.company_name ?? client.person_name ?? '').trim();
	//
	// 		handleChange('client', label);
	// 		handleChange('client_id', id);
	// 		setSearchClient(label);
	// 	};
	//
	// 	window.addEventListener(
	// 		CLIENT_ADDRESS_NEW_CLIENT_CREATED_EVENT,
	// 		onNewClient,
	// 	);
	//
	// 	return () => {
	// 		window.removeEventListener(
	// 			CLIENT_ADDRESS_NEW_CLIENT_CREATED_EVENT,
	// 			onNewClient,
	// 		);
	// 	};
	// }, [handleChange]);

	return (
		<>
			<FormComponentRadio<ClientAddressFormValuesType>
				labelText="Address Type"
				id={elementIds.address_type}
				fieldName="address_type"
				fieldValue={formValues.address_type}
				options={addressTypes}
				disabled={pending}
				onValueChange={(value) =>
					handleChange('address_type', value as ClientAddressTypeEnum)
				}
				error={errors.address_type}
			/>

			<FormComponentAutoComplete<ClientAddressFormValuesType, ClientModel>
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
					suggestions: clients,
					isLoading: isClientLoading,
					onSelect: (c) => {
						handleChange('client', getClientDisplayName(c));
						handleChange('client_id', c.id);
					},
					getOptionLabel: (c) => getClientDisplayName(c),
					getOptionKey: (c) => c.id,

					allowCreate: true,

					onCreate: (value) => {
						const event = new CustomEvent('useDataTableAction', {
							detail: {
								source: 'client-address',
								actionName: 'createClient',
								entry: {
									client_type: ClientTypeEnum.COMPANY,
									company_name: value,
									person_name: value,
								},
							},
						});

						window.dispatchEvent(event);

						// const newClient = await createClientMutation.mutateAsync(value);
						//
						// if (!newClient) {
						// 	return;
						// }
						//
						// handleChange('client', value);
						// handleChange('client_id', newClient.id as number);
					},

					createLabel: (value) => `Create client "${value}"`,
				}}
				icons={{
					left: <Icons.Client className="opacity-40 h-4.5 w-4.5" />,
				}}
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
					suggestions: cities,
					isLoading: isCityLoading,
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
