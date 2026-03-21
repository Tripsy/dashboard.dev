import { z } from 'zod';
import { Configuration } from '@/config/settings.config';
import { translateBatch } from '@/config/translate.setup';
import { BaseValidator } from '@/helpers/validator.helper';
import type { FormSituationType } from '@/types/form.type';

export type PasswordRecoverChangeFormFieldsType = {
	password?: string;
	password_confirm?: string;
};

export type PasswordRecoverChangeSituationType =
	| FormSituationType
	| 'csrf_error';

export type PasswordRecoverChangeStateType = {
	token: string;
	values: PasswordRecoverChangeFormFieldsType;
	errors: Partial<
		Record<keyof PasswordRecoverChangeFormFieldsType, string[]>
	>;
	message: string | null;
	situation: PasswordRecoverChangeSituationType;
};

export const PasswordRecoverChangeState: PasswordRecoverChangeStateType = {
	token: '',
	values: {
		password: '',
		password_confirm: '',
	},
	errors: {},
	message: null,
	situation: null,
};

const translationValidation = await translateBatch(
	[
		'password-recover-change.validation.invalid_password',
		{
			key: 'password-recover-change.validation.password_min',
			vars: {
				min: Configuration.get('user.passwordMinLength') as string,
			},
		},
		'password-recover-change.validation.password_condition_capital_letter',
		'password-recover-change.validation.password_condition_number',
		'password-recover-change.validation.password_condition_special_character',
		'password-recover-change.validation.password_confirm_required',
		'password-recover-change.validation.password_confirm_mismatch',
	],
	'password-recover-change.validation.',
);

class PasswordRecoverChangeValidator extends BaseValidator {
	constructor(private readonly message: Record<string, string>) {
		super();
	}

	passwordRecoverChange() {
		return z
			.object({
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

export const PasswordRecoverChangeSchema = new PasswordRecoverChangeValidator(
	translationValidation,
).passwordRecoverChange();
