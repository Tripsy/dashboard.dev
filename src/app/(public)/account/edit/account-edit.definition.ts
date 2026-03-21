import { z } from 'zod';
import { Configuration } from '@/config/settings.config';
import { translateBatch } from '@/config/translate.setup';
import { BaseValidator } from '@/helpers/validator.helper';
import { LanguageEnum } from '@/models/user.model';
import type { FormSituationType } from '@/types/form.type';

export type AccountEditFormFieldsType = {
	name?: string;
	language?: LanguageEnum;
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

const translationValidation = await translateBatch(
	[
		'account-edit.validation.invalid_name',
		{
			key: 'account-edit.validation.name_min',
			vars: {
				min: Configuration.get('user.nameMinChars') as string,
			},
		},
		'account-edit.validation.invalid_language',
	],
	'account-edit.validation.',
);

class AccountEditValidator extends BaseValidator {
	constructor(private readonly message: Record<string, string>) {
		super();
	}

	accountEdit() {
		return z.object({
			name: this.validateString(
				{
					invalid: this.message.invalid_name,
					min_chars: this.message.name_min,
				},
				{
					minChars: Configuration.get('user.nameMinChars') as number,
				},
			),
			language: this.validateEnum(
				LanguageEnum,
				this.message.invalid_language,
			),
		});
	}
}

export const AccountEditSchema = new AccountEditValidator(
	translationValidation,
).accountEdit();
