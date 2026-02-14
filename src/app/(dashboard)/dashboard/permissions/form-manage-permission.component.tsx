import { useMemo } from 'react';
import { FormComponentAutoComplete } from '@/components/form/form-element.component';
import { Icons } from '@/components/icon.component';
import type { FormManageType } from '@/config/data-source.config';
import { useAutocomplete } from '@/hooks/use-autocomplete';
import { useElementIds } from '@/hooks/use-element-ids.hook';
import { useTranslation } from '@/hooks/use-translation.hook';
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
	const translationsKeys = useMemo(
		() =>
			[
				'permissions.form_manage.label_entity',
				'permissions.form_manage.label_operation',
			] as const,
		[],
	);

	const { translations } = useTranslation(translationsKeys);

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
			<FormComponentAutoComplete<PermissionFormValuesType>
				labelText={translations['permissions.form_manage.label_entity']}
				id={elementIds.entity}
				fieldName="entity"
				fieldValue={formValues.entity}
				className="pl-8"
				isRequired={true}
				disabled={pending}
				error={errors.entity}
				onChange={(value) => handleChange('entity', value)}
				autoCompleteProps={{
					suggestions: entityAutocomplete.suggestions,
					onSearch: entityAutocomplete.onSearch,
					minQueryLength: 2,
					dropdown: false,
				}}
				icons={{
					left: (
						<Icons.TextSearch className="opacity-40 h-4.5 w-4.5" />
					),
				}}
			/>

			<FormComponentAutoComplete<PermissionFormValuesType>
				labelText={
					translations['permissions.form_manage.label_operation']
				}
				id={elementIds.operation}
				fieldName="operation"
				fieldValue={formValues.operation}
				className="pl-8"
				isRequired={true}
				disabled={pending}
				error={errors.operation}
				onChange={(value) => handleChange('operation', value)}
				autoCompleteProps={{
					suggestions: operationAutocomplete.suggestions,
					onSearch: operationAutocomplete.onSearch,
					minQueryLength: 2,
					dropdown: false,
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
