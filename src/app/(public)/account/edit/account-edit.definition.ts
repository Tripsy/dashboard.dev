import { z } from 'zod';
import { Configuration } from '@/config/settings.config';
import { getFormDataAsEnum, getFormDataAsString } from '@/helpers/form.helper';
import { BaseValidator } from '@/helpers/validator.helper';
import {
	LANGUAGE_DEFAULT,
	type Language,
	LanguageEnum,
} from '@/types/common.type';
import type { FormSituationType } from '@/types/form.type';

export type AccountEditFormValuesType = {
	name: string | null;
	language: Language;
};

export type AccountEditSituationType = FormSituationType | 'csrf_error';

export type AccountEditStateType = {
	values: AccountEditFormValuesType;
	errors: Partial<Record<keyof AccountEditFormValuesType, string[]>>;
	message: string | null;
	situation: AccountEditSituationType;
};

export const AccountEditState: AccountEditStateType = {
	values: {
		name: '',
		language: LANGUAGE_DEFAULT,
	},
	errors: {},
	message: null,
	situation: null,
};

const validatorMessages = await BaseValidator.getValidatorMessages(
	['invalid_name', 'name_min', 'invalid_language'] as const,
	'account-edit.validation',
);

class AccountEditValidator extends BaseValidator<typeof validatorMessages> {
	accountEdit = z.object({
		name: this.validateString(
			{
				invalid: this.getMessage('invalid_name'),
				min_chars: this.getMessage('name_min', {
					min: Configuration.get('user.nameMinChars') as string,
				}),
			},
			{
				minChars: Configuration.get('user.nameMinChars') as number,
			},
		),
		language: this.validateLanguage(this.getMessage('invalid_language')),
	});
}

export function validateFormAccountEdit(values: AccountEditFormValuesType) {
	const validator = new AccountEditValidator(validatorMessages);

	return validator.accountEdit.safeParse(values);
}

export function getAccountEditFormValues(
	formData: FormData,
): AccountEditFormValuesType {
	return {
		name: getFormDataAsString(formData, 'name'),
		language:
			getFormDataAsEnum(formData, 'language', LanguageEnum) ||
			LANGUAGE_DEFAULT,
	};
}
