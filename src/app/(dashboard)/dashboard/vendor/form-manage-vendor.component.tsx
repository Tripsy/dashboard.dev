import { FormComponentInput } from '@/components/form/form-element.component';
import { useElementIds } from '@/hooks/use-element-ids.hook';
import { useWindowForm } from '@/providers/window-form.provider';

export type VendorFormValuesType = {
	name: string | null;
};

export function FormManageVendor() {
	const { formValues, errors, handleChange, pending } =
		useWindowForm<VendorFormValuesType>();

	const elementIds = useElementIds(['name'] as const);

	return (
		<FormComponentInput<VendorFormValuesType>
			labelText="Name"
			id={elementIds.name}
			fieldName="name"
			fieldValue={formValues.name ?? ''}
			isRequired={true}
			placeholderText="e.g.: Petrom"
			disabled={pending}
			onChange={(e) => handleChange('name', e.target.value)}
			error={errors.name}
		/>
	);
}
