'use client';

import type { AccountEditFormValuesType } from '@/app/(public)/account/edit/account-edit.definition';
import {
	FormComponentName,
	FormComponentRadio,
} from '@/components/form/form-element.component';
import { toOptionsFromEnum } from '@/helpers/form.helper';
import { formatEnumLabel } from '@/helpers/string.helper';
import { useElementIds } from '@/hooks/use-element-ids.hook';
import { useWindowForm } from '@/providers/window-form.provider';
import { type Language, LanguageEnum } from '@/types/common.type';

const languages = toOptionsFromEnum(LanguageEnum, {
	formatter: formatEnumLabel,
});

export function FormManageAccountEdit() {
	const { formValues, errors, handleChange, pending } =
		useWindowForm<AccountEditFormValuesType>();

	const elementIds = useElementIds(['name', 'language'] as const);

	return (
		<>
			<FormComponentName<AccountEditFormValuesType>
				labelText="Name"
				id={elementIds.name}
				fieldValue={formValues.name ?? ''}
				disabled={pending}
				onChange={(e) => handleChange('name', e.target.value)}
				error={errors.name}
			/>

			<FormComponentRadio<AccountEditFormValuesType>
				labelText="Language"
				id={elementIds.language}
				fieldName="language"
				fieldValue={formValues.language}
				disabled={pending}
				options={languages}
				onChange={(value) =>
					handleChange('language', value as Language)
				}
				error={errors.language}
			/>
		</>
	);
}
