import { z } from 'zod';
import { Configuration } from '@/config/settings.config';
import { BaseValidator } from '@/helpers/validator.helper';
import { LanguageEnum } from '@/models/user.model';
import type { FormSituationType } from '@/types/form.type';

export type AccountEditFormFieldsType = {
	name: string | null;
	language: LanguageEnum;
};

export type AccountEditSituationType = FormSituationType | 'csrf_error';

export type AccountEditStateType = {
	values: AccountEditFormFieldsType;
	errors: Partial<Record<keyof AccountEditFormFieldsType, string[]>>;
	message: string | null;
	situation: AccountEditSituationType;
};

export const AccountEditState: AccountEditStateType = {
	values: {
		name: '',
		language: LanguageEnum.RO,
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

export const AccountEditSchema = new AccountEditValidator(validatorMessages)
	.accountEdit;
