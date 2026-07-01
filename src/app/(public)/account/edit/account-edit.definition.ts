import { z } from 'zod';
import { Configuration } from '@/config/settings.config';
import { getLanguage, translateBatch } from '@/config/translate.setup';
import { getFormDataAsEnum, getFormDataAsString } from '@/helpers/form.helper';
import { BaseValidator } from '@/helpers/validator.helper';
import { type Language, LanguageEnum } from '@/types/common.type';
import type { FormSituationType } from '@/types/form.type';

export type AccountEditFormValuesType = {
	name: string | null;
	language: Language;
};

export type AccountEditSituationType = FormSituationType | 'csrfError';

export type AccountEditStateType = {
	values: AccountEditFormValuesType;
	errors: Partial<Record<keyof AccountEditFormValuesType, string[]>>;
	message: string | null;
	situation: AccountEditSituationType;
};

export const AccountEditState: AccountEditStateType = {
	values: {
		name: '',
		language: Configuration.language(),
	},
	errors: {},
	message: null,
	situation: null,
};

const validatorMessages = [
	'invalid_name',
	'name_min',
	'invalid_language',
] as const;

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

export async function validateFormAccountEdit(
	values: AccountEditFormValuesType,
) {
	const translations = await translateBatch(
		validatorMessages,
		'account-edit.validation',
	);

	const validator = new AccountEditValidator(translations);

	return validator.accountEdit.safeParse(values);
}

export async function getAccountEditFormValues(
	formData: FormData,
): Promise<AccountEditFormValuesType> {
	return {
		name: getFormDataAsString(formData, 'name'),
		language:
			getFormDataAsEnum(formData, 'language', LanguageEnum) ||
			(await getLanguage()),
	};
}
