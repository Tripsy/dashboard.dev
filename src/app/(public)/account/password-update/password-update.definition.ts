import { z } from 'zod';
import { Configuration } from '@/config/settings.config';
import { translateBatch } from '@/config/translate.setup';
import { BaseValidator } from '@/helpers/validator.helper';
import type { FormSituationType } from '@/types/form.type';

export type PasswordUpdateFormFieldsType = {
	password_current?: string;
	password_new?: string;
	password_confirm?: string;
};

export type PasswordUpdateSituationType = FormSituationType | 'csrf_error';

export type PasswordUpdateStateType = {
	values: PasswordUpdateFormFieldsType;
	errors: Partial<Record<keyof PasswordUpdateFormFieldsType, string[]>>;
	message: string | null;
	situation: PasswordUpdateSituationType;
};

export const PasswordUpdateState: PasswordUpdateStateType = {
	values: {
		password_current: '',
		password_new: '',
		password_confirm: '',
	},
	errors: {},
	message: null,
	situation: null,
};

const translationValidation = await translateBatch(
	[
		'account-password-update.validation.invalid_password_current',
		'account-password-update.validation.invalid_password_new',
		{
			key: 'account-password-update.validation.password_min',
			vars: {
				min: Configuration.get('user.passwordMinLength') as string,
			},
		},
		'account-password-update.validation.password_condition_capital_letter',
		'account-password-update.validation.password_condition_number',
		'account-password-update.validation.password_condition_special_character',
		'account-password-update.validation.password_confirm_required',
		'account-password-update.validation.password_confirm_mismatch',
	],
	'account-password-update.validation.',
);

class PasswordUpdateValidator extends BaseValidator {
	constructor(private readonly message: Record<string, string>) {
		super();
	}

	passwordUpdate() {
		return z
			.object({
				password_current: this.validateString(
					this.message.invalid_password,
				),
				password_new: this.validatePassword(
					{
						password_invalid: this.message.invalid_password_new,
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
			})
			.superRefine(({ password_new, password_confirm }, ctx) => {
				if (password_new !== password_confirm) {
					ctx.addIssue({
						path: ['password_confirm'],
						message: this.message.password_confirm_mismatch,
						code: 'custom',
					});
				}
			});
	}
}

export const PasswordUpdateSchema = new PasswordUpdateValidator(
	translationValidation,
).passwordUpdate();
