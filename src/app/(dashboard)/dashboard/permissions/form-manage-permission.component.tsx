import { FormComponentAutoComplete } from '@/components/form/form-element.component';
import { Icons } from '@/components/icon.component';
import type { FormManageType } from '@/config/data-source.config';
import { useAutocomplete } from '@/hooks/use-autocomplete';
import { useElementIds } from '@/hooks/use-element-ids.hook';
import {
	PermissionEntitiesSuggestions,
	type PermissionFormValuesType,
	PermissionOperationSuggestions,
} from '@/models/permission.model';

export function FormManagePermission({
	formValues,
	errors,
	handleChange,
	pending,
}: FormManageType<PermissionFormValuesType>) {
	const entityAutocomplete = useAutocomplete(PermissionEntitiesSuggestions, {
		filterMode: 'includes',
		caseSensitive: false,
	});

	const operationAutocomplete = useAutocomplete(
		PermissionOperationSuggestions,
		{
			filterMode: 'includes',
			caseSensitive: false,
		},
	);

	const elementIds = useElementIds(['entity', 'operation']);

	return (
		<>
			<FormComponentAutoComplete<PermissionFormValuesType, string>
				labelText="Entity"
				id={elementIds.entity}
				fieldName="entity"
				fieldValue={formValues.entity}
				className="pl-8"
				isRequired={true}
				disabled={pending}
				error={errors.entity}
				onInputChange={(value: string | null) => handleChange('entity', value)}
				autoCompleteProps={{
					suggestions: entityAutocomplete.suggestions,
					onSearch: entityAutocomplete.onSearch,
					minQueryLength: 2,
					dropdown: false,
					getOptionLabel: (item) => item,
				}}
				icons={{
					left: (
						<Icons.TextSearch className="opacity-40 h-4.5 w-4.5" />
					),
				}}
			/>

			<FormComponentAutoComplete<PermissionFormValuesType, string>
				labelText="Operation"
				id={elementIds.operation}
				fieldName="operation"
				fieldValue={formValues.operation}
				className="pl-8"
				isRequired={true}
				disabled={pending}
				error={errors.operation}
				onInputChange={(value: string | null) => handleChange('operation', value)}
				autoCompleteProps={{
					suggestions: operationAutocomplete.suggestions,
					onSearch: operationAutocomplete.onSearch,
					minQueryLength: 2,
					dropdown: false,
					getOptionLabel: (item) => item,
				}}
				icons={{
					left: (
						<Icons.TextSearch className="opacity-40 h-4.5 w-4.5" />
					),
				}}
			/>
		</>
	);
}
