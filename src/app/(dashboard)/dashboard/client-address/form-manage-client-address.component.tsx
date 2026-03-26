import {
	FormComponentAutoComplete,
	FormComponentInput,
	FormComponentRadio
} from '@/components/form/form-element.component';
import type { FormManageType } from '@/config/data-source.config';
import { formatEnumLabel } from '@/helpers/string.helper';
import { useElementIds } from '@/hooks/use-element-ids.hook';
import {
	type ClientAddressFormValuesType,
	ClientAddressTypeEnum,
} from '@/models/client-address.model';
import {toOptionsFromEnum} from "@/helpers/form.helper";
import {Icons} from "@/components/icon.component";
import {CityModel, getPlaceContentProp} from "@/models/place.model";
import {getLanguage} from "@/config/translate.setup";
import {useState} from "react";

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
		'city',
		'details',
		'postal_code',
		'notes',
	] as const);

	const [cities, setCities] = useState<CityModel[]>([])
	const fetchCities = async (query: string) => { ... }

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

			{/*<FormComponentAutoComplete<ClientAddressFormValuesType>*/}
			{/*	labelText="Client"*/}
			{/*	id={elementIds.client}*/}
			{/*	fieldName="client"*/}
			{/*	fieldValue={formValues.client ?? ''}*/}
			{/*	className="pl-8"*/}
			{/*	isRequired={true}*/}
			{/*	disabled={pending}*/}
			{/*	onChange={(value) => handleChange('client', value)}*/}
			{/*	error={errors.client}*/}
			{/*	autoCompleteProps={{*/}
			{/*		suggestions: [],*/}
			{/*		onSearch: function (query: string): void {*/}
			{/*			throw new Error("Function not implemented.");*/}
			{/*		},*/}
			{/*		minQueryLength: 3,*/}
			{/*		maxSuggestions: 10,*/}
			{/*		dropdown: false*/}
			{/*	}}*/}
			{/*	icons={{*/}
			{/*		left: (*/}
			{/*			<Icons.TextSearch className="opacity-40 h-4.5 w-4.5" />*/}
			{/*		),*/}
			{/*	}}*/}
			{/*/>*/}

			<FormComponentAutoComplete<ClientAddressFormValuesType, CityModel>
				labelText="City"
				id={elementIds.city}
				fieldName="city"
				fieldValue={formValues.city ?? ''}
				className="pl-8"
				isRequired={false}
				disabled={pending}
				onInputChange={(value) => {
					handleChange('city', value);
					handleChange('city_id', null);
				}}
				error={errors.city}
				autoCompleteProps={{
					suggestions: cities,
					onSearch: fetchCities,
					onSelect: (c) => {
						handleChange('city', getPlaceContentProp(c, language));
						handleChange('city_id', c.id);
					},
					getOptionLabel: (c) => getPlaceContentProp(c, language),
					getOptionKey: (c) => c.id,
					minQueryLength: 3,
					maxSuggestions: 10,
					dropdown: false
				}}
				icons={{
					left: (
						<Icons.City className="opacity-40 h-4.5 w-4.5" />
					),
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
