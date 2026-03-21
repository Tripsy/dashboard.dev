import { useState } from 'react';
import { FormComponentRadio } from '@/components/form/form-element.component';
import type { FormManageType } from '@/config/data-source.config';
import { formatEnumLabel } from '@/helpers/string.helper';
import { useElementIds } from '@/hooks/use-element-ids.hook';
import {
	type ClientAddressFormValuesType,
	ClientAddressTypeEnum,
} from '@/models/client-address.model';

const addressTypes = Object.values(ClientAddressTypeEnum).map((v) => ({
	label: formatEnumLabel(v),
	value: v,
}));

export function FormManageClientAddress({
	formValues,
	errors,
	handleChange,
	pending,
}: FormManageType<ClientAddressFormValuesType>) {
	const elementIds = useElementIds([
		'client_id',
		'address_type',
		'city_id',
		'details',
		'postal_code',
		'notes',
	]);

	return (
		<>
			<FormComponentName<ClientAddressFormValuesType>
				labelText="Name"
				id={elementIds.name}
				fieldValue={formValues.name ?? ''}
				disabled={pending}
				onChange={(e) => handleChange('name', e.target.value)}
				error={errors.name}
			/>

			<FormComponentEmail<ClientAddressFormValuesType>
				labelText="Email"
				id={elementIds.email}
				fieldValue={formValues.email ?? ''}
				disabled={pending}
				onChange={(e) => handleChange('email', e.target.value)}
				error={errors.email}
			/>

			<FormComponentPassword<ClientAddressFormValuesType>
				labelText="Password"
				id={elementIds.password}
				fieldName="password"
				fieldValue={formValues.password ?? ''}
				disabled={pending}
				onChange={(e) => handleChange('password', e.target.value)}
				error={errors.password}
				showPassword={showPassword}
				setShowPassword={setShowPassword}
			/>

			<FormComponentPassword<ClientAddressFormValuesType>
				labelText="Confirm Password"
				id={elementIds.passwordConfirm}
				fieldName="password_confirm"
				fieldValue={formValues.password_confirm ?? ''}
				placeholderText="Password confirmation"
				disabled={pending}
				onChange={(e) =>
					handleChange('password_confirm', e.target.value)
				}
				error={errors.password_confirm}
				showPassword={showPassword}
			/>

			<FormComponentSelect<ClientAddressFormValuesType>
				labelText="Language"
				id={elementIds.language}
				fieldName="language"
				fieldValue={formValues.language}
				disabled={pending}
				options={languages}
				onValueChange={(value) => handleChange('language', value)}
				error={errors.language}
			/>

			<FormComponentRadio<ClientAddressFormValuesType>
				labelText="Role"
				id={elementIds.address_type}
				fieldName="address_type"
				fieldValue={formValues.address_type}
				options={addressTypes}
				disabled={pending}
				onValueChange={(value) => handleChange('address_type', value)}
				error={errors.address_type}
			/>
		</>
	);
}
