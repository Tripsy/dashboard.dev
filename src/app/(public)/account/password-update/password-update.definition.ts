import { z } from 'zod';
import { Configuration } from '@/config/settings.config';
import { BaseValidator } from '@/helpers/validator.helper';
import type { FormSituationType } from '@/types/form.type';

export type PasswordUpdateFormFieldsType = {
	password_current: string;
	password_new: string;
	password_confirm: string;
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

const validatorMessages = await BaseValidator.getValidatorMessages(
	[
		'invalid_password_current',
		'invalid_password_new',
		'password_min',
		'password_condition_capital_letter',
		'password_condition_number',
		'password_condition_special_character',
		'password_confirm_required',
		'password_confirm_mismatch',
	] as const,
	'account-password-update.validation',
);

class PasswordUpdateValidator extends BaseValidator<typeof validatorMessages> {
	passwordUpdate = z.object({
		password_current: this.validateString(
			this.getMessage('invalid_password_current'),
		),
		password_new: this.validatePassword(
			{
				invalid_password: this.getMessage(
					'invalid_password_new'),
				password_min: this.getMessage('password_min', {
					min: Configuration.get('user.passwordMinChars') as string,
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
	.superRefine(({ password_new, password_confirm }, ctx) => {
		if (password_new !== password_confirm) {
			ctx.addIssue({
				path: ['password_confirm'],
				message: this.getMessage('password_confirm_mismatch'),
				code: 'custom',
			});
		}
	});
}

export const PasswordUpdateSchema = new PasswordUpdateValidator(
	validatorMessages,
).passwordUpdate;
