import { z } from 'zod';
import { Configuration } from '@/config/settings.config';
import { BaseValidator } from '@/helpers/validator.helper';
import type { FormSituationType } from '@/types/form.type';

export type PasswordRecoverChangeFormFieldsType = {
	password: string | null;
	password_confirm: string | null;
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

const validatorMessages = await BaseValidator.getValidatorMessages(
	[
		'invalid_password',
		'password_min',
		'password_condition_capital_letter',
		'password_condition_number',
		'password_condition_special_character',
		'password_confirm_required',
		'password_confirm_mismatch',
	],
	'password-recover-change.validation',
);

class PasswordRecoverChangeValidator extends BaseValidator<
	typeof validatorMessages
> {
	passwordRecoverChange = z
		.object({
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

export const PasswordRecoverChangeSchema = new PasswordRecoverChangeValidator(
	validatorMessages,
).passwordRecoverChange;
