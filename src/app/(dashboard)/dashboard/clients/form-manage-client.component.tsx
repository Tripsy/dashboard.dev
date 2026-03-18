import {
	FormComponentInput,
	FormComponentRadio,
	FormComponentSelect,
	FormComponentTextarea,
} from '@/components/form/form-element.component';
import type { FormManageType } from '@/config/data-source.config';
import {
	capitalizeFirstLetter,
	formatEnumLabel,
} from '@/helpers/string.helper';
import { useElementIds } from '@/hooks/use-element-ids.hook';
import {
	type ClientFormValuesType,
	ClientStatusEnum,
	ClientTypeEnum,
} from '@/models/client.model';

const clientTypes = Object.values(ClientTypeEnum).map((v) => ({
	label: formatEnumLabel(v),
	value: v,
}));

const clientStatuses = Object.values(ClientStatusEnum).map((v) => ({
	label: capitalizeFirstLetter(v),
	value: v,
}));

export function FormManageClient({
	formValues,
	errors,
	handleChange,
	pending,
}: FormManageType<ClientFormValuesType>) {
	const elementIds = useElementIds([
		'clientType',
		'status',
		'companyName',
		'companyCui',
		'companyRegCom',
		'personName',
		'personCnp',
		'iban',
		'bankName',
		'addressCountry',
		'addressRegion',
		'addressCity',
		'addressInfo',
		'addressPostalCode',
		'contactName',
		'contactEmail',
		'contactPhone',
		'notes',
	]);

	return (
		<>
			<FormComponentRadio<ClientFormValuesType>
				labelText="Type"
				id={elementIds.clientType}
				fieldName="client_type"
				fieldValue={formValues.client_type}
				options={clientTypes}
				disabled={pending}
				onValueChange={(value) => handleChange('client_type', value)}
				error={errors.client_type}
			/>

			{formValues.client_type === ClientTypeEnum.COMPANY && (
				<>
					<FormComponentInput<ClientFormValuesType>
						labelText="Company - Name"
						id={elementIds.companyName}
						fieldName="company_name"
						fieldValue={formValues.company_name ?? ''}
						isRequired={true}
						disabled={pending}
						onChange={(e) =>
							handleChange('company_name', e.target.value)
						}
						error={errors.company_name}
					/>

					<FormComponentInput<ClientFormValuesType>
						labelText="Company - CUI"
						id={elementIds.companyCui}
						fieldName="company_cui"
						fieldValue={formValues.company_cui ?? ''}
						isRequired={false}
						disabled={pending}
						onChange={(e) =>
							handleChange('company_cui', e.target.value)
						}
						error={errors.company_cui}
					/>

					<FormComponentInput<ClientFormValuesType>
						labelText="Company - Reg. Com"
						id={elementIds.companyRegCom}
						fieldName="company_reg_com"
						fieldValue={formValues.company_reg_com ?? ''}
						isRequired={false}
						disabled={pending}
						onChange={(e) =>
							handleChange('company_reg_com', e.target.value)
						}
						error={errors.company_reg_com}
					/>
				</>
			)}

			{formValues.client_type === ClientTypeEnum.PERSON && (
				<>
					<FormComponentInput<ClientFormValuesType>
						labelText="Person - Name"
						id={elementIds.personName}
						fieldName="person_name"
						fieldValue={formValues.person_name ?? ''}
						isRequired={true}
						disabled={pending}
						onChange={(e) =>
							handleChange('person_name', e.target.value)
						}
						error={errors.person_name}
					/>

					<FormComponentInput<ClientFormValuesType>
						labelText="Person - CNP"
						id={elementIds.personCnp}
						fieldName="person_cnp"
						fieldValue={formValues.person_cnp ?? ''}
						isRequired={false}
						disabled={pending}
						onChange={(e) =>
							handleChange('person_cnp', e.target.value)
						}
						error={errors.person_cnp}
					/>
				</>
			)}

			<FormComponentInput<ClientFormValuesType>
				labelText="IBAN"
				id={elementIds.iban}
				fieldName="iban"
				fieldValue={formValues.iban ?? ''}
				isRequired={false}
				disabled={pending}
				onChange={(e) => handleChange('iban', e.target.value)}
				error={errors.iban}
			/>

			<FormComponentInput<ClientFormValuesType>
				labelText="Bank Name"
				id={elementIds.bankName}
				fieldName="bank_name"
				fieldValue={formValues.bank_name ?? ''}
				isRequired={false}
				disabled={pending}
				onChange={(e) => handleChange('bank_name', e.target.value)}
				error={errors.bank_name}
			/>

			<FormComponentInput<ClientFormValuesType>
				labelText="Contact - Name"
				id={elementIds.contactName}
				fieldName="contact_name"
				fieldValue={formValues.contact_name ?? ''}
				isRequired={false}
				disabled={pending}
				onChange={(e) => handleChange('contact_name', e.target.value)}
				error={errors.contact_name}
			/>

			<FormComponentInput<ClientFormValuesType>
				labelText="Contact - Email"
				id={elementIds.contactEmail}
				fieldName="contact_email"
				fieldValue={formValues.contact_email ?? ''}
				isRequired={false}
				disabled={pending}
				onChange={(e) => handleChange('contact_email', e.target.value)}
				error={errors.contact_email}
			/>

			<FormComponentInput<ClientFormValuesType>
				labelText="Contact - Phone"
				id={elementIds.contactPhone}
				fieldName="contact_phone"
				fieldValue={formValues.contact_phone ?? ''}
				isRequired={false}
				disabled={pending}
				onChange={(e) => handleChange('contact_phone', e.target.value)}
				error={errors.contact_phone}
			/>

			<FormComponentTextarea<ClientFormValuesType>
				labelText="Notes"
				id={elementIds.notes}
				fieldName="notes"
				fieldValue={formValues.notes ?? ''}
				isRequired={false}
				disabled={pending}
				onChange={(e) => handleChange('notes', e.target.value)}
				error={errors.notes}
				rows={4}
			/>
		</>
	);
}
