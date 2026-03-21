import { z } from 'zod';
import { Configuration } from '@/config/settings.config';
import { translateBatch } from '@/config/translate.setup';
import { BaseValidator } from '@/helpers/validator.helper';
import { LanguageEnum } from '@/models/user.model';
import type { FormSituationType } from '@/types/form.type';

export type RegisterFormFieldsType = {
	name?: string;
	email?: string;
	password?: string;
	password_confirm?: string;
	language?: LanguageEnum;
	terms: boolean;
};

export type RegisterSituationType =
	| FormSituationType
	| 'csrf_error'
	| 'pending_account';

export type RegisterStateType = {
	values: RegisterFormFieldsType;
	errors: Partial<Record<keyof RegisterFormFieldsType, string[]>>;
	message: string | null;
	situation: RegisterSituationType;
};

export const RegisterState: RegisterStateType = {
	values: {
		name: '',
		email: '',
		password: '',
		password_confirm: '',
		language: LanguageEnum.RO,
		terms: false,
	},
	errors: {},
	message: null,
	situation: null,
};

const translationValidation = await translateBatch(
	[
		'register.validation.invalid_name',
		{
			key: 'register.validation.name_min',
			vars: {
				min: Configuration.get('user.nameMinChars') as string,
			},
		},
		'register.validation.invalid_email',
		'register.validation.invalid_password',
		{
			key: 'register.validation.password_min',
			vars: {
				min: Configuration.get('user.passwordMinLength') as string,
			},
		},
		'register.validation.password_condition_capital_letter',
		'register.validation.password_condition_number',
		'register.validation.password_condition_special_character',
		'register.validation.password_confirm_required',
		'register.validation.password_confirm_mismatch',
		'register.validation.invalid_language',
		'register.validation.terms_required',
	],
	'register.validation.',
);

class RegisterValidator extends BaseValidator {
	constructor(private readonly message: Record<string, string>) {
		super();
	}

	register() {
		return z
			.object({
				name: this.validateString(
					{
						invalid: this.message.invalid_name,
						min_chars: this.message.name_min,
					},
					{
						minChars: Configuration.get(
							'user.nameMinChars',
						) as number,
					},
				),
				email: this.validateEmail(this.message.invalid_email),
				password: this.validatePassword(
					{
						password_invalid: this.message.invalid_password,
						password_min: this.message.password_min,
						password_condition_capital_letter:
							this.message.password_condition_capital_letter,
						password_condition_number:
							this.message.password_condition_number,
						password_condition_special_character:
							this.message.password_condition_special_character,
					},
					{
						minLength: Configuration.get(
							'user.passwordMinLength',
						) as number,
					},
				),
				password_confirm: this.validateString(
					this.message.password_confirm_required,
				),
				language: this.validateEnum(
					LanguageEnum,
					this.message.invalid_language,
				),
				terms: this.validateBoolean(this.message.terms_required),
			})
			.superRefine(({ password, password_confirm }, ctx) => {
				if (password !== password_confirm) {
					ctx.addIssue({
						path: ['password_confirm'],
						message: this.message.password_confirm_mismatch,
						code: 'custom',
					});
				}
			});
	}
}

export const RegisterSchema = new RegisterValidator(
	translationValidation,
).register();
