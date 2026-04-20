import { z } from 'zod';
import { Configuration } from '@/config/settings.config';
import { BaseValidator } from '@/helpers/validator.helper';
import { type Language, LanguageEnum } from '@/models/user.model';
import type { FormSituationType } from '@/types/form.type';

export type RegisterFormFieldsType = {
	name: string | null;
	email: string | null;
	password: string | null;
	password_confirm: string | null;
	language: Language;
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

const validatorMessages = await BaseValidator.getValidatorMessages(
	[
		'invalid_name',
		'name_min',
		'invalid_email',
		'invalid_password',
		'password_min',
		'password_condition_capital_letter',
		'password_condition_number',
		'password_condition_special_character',
		'password_confirm_required',
		'password_confirm_mismatch',
		'invalid_language',
		'terms_required',
	] as const,
	'register.validation',
);

class RegisterValidator extends BaseValidator<typeof validatorMessages> {
	register = z
		.object({
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
			email: this.validateEmail(this.getMessage('invalid_email')),
			password: this.validatePassword(
				{
					invalid_password: this.getMessage('invalid_password'),
					password_min: this.getMessage('password_min', {
						min: Configuration.get(
							'user.passwordMinChars',
						) as string,
					}),
					password_condition_capital_letter: this.getMessage(
						'password_condition_capital_letter',
					),
					password_condition_number: this.getMessage(
						'password_condition_number',
					),
					password_condition_special_character: this.getMessage(
						'password_condition_special_character',
					),
				},
				{
					minLength: Configuration.get(
						'user.passwordMinChars',
					) as number,
				},
			),
			password_confirm: this.validateString(
				this.getMessage('password_confirm_required'),
			),
			language: this.validateLanguage(
				this.getMessage('invalid_language'),
			),
			terms: this.validateBoolean(this.getMessage('terms_required')),
		})
		.superRefine(({ password, password_confirm }, ctx) => {
			if (password !== password_confirm) {
				ctx.addIssue({
					path: ['password_confirm'],
					message: this.getMessage('password_confirm_mismatch'),
					code: 'custom',
				});
			}
		});
}

export const RegisterSchema = new RegisterValidator(validatorMessages).register;
