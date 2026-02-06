import { useMemo } from 'react';
import { FormComponentAutoComplete } from '@/components/form/form-element.component';
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
			<FormComponentAutoComplete
				labelText={translations['permissions.form_manage.label_entity']}
				id={elementIds.entity}
				fieldName="entity"
				fieldValue={formValues.entity}
				disabled={pending}
				onChange={(e) => handleChange('entity', e.target.value)}
				error={errors.entity}
				suggestions={entityAutocomplete.suggestions}
				completeMethod={entityAutocomplete.completeMethod}
			/>

			<FormComponentAutoComplete
				labelText={
					translations['permissions.form_manage.label_operation']
				}
				id={elementIds.operation}
				fieldName="operation"
				fieldValue={formValues.operation}
				disabled={pending}
				onChange={(e) => handleChange('operation', e.target.value)}
				error={errors.operation}
				suggestions={operationAutocomplete.suggestions}
				completeMethod={operationAutocomplete.completeMethod}
			/>
		</>
	);
}
