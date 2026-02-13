import { z } from 'zod';
import { Configuration } from '@/config/settings.config';
import { translateBatch } from '@/config/translate.setup';
import type { FormSituationType } from '@/types';

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

const translations = await translateBatch([
	'account-password-update.validation.password_current_invalid',
	'account-password-update.validation.password_new_invalid',
	{
		key: 'account-password-update.validation.password_new_min',
		vars: {
			min: Configuration.get('user.passwordMinLength') as string,
		},
	},
	'account-password-update.validation.password_new_condition_capital_letter',
	'account-password-update.validation.password_new_condition_number',
	'account-password-update.validation.password_new_condition_special_character',
	'account-password-update.validation.password_confirm_required',
	'account-password-update.validation.password_confirm_mismatch',
]);

export const PasswordUpdateSchema = z
	.object({
		password_current: z
			.string({
				message:
					translations[
						'account-password-update.validation.password_current_invalid'
					],
			})
			.trim()
			.nonempty({
				message:
					translations[
						'account-password-update.validation.password_current_invalid'
					],
			}),
		password_new: z
			.string({
				message:
					translations[
						'account-password-update.validation.password_new_invalid'
					],
			})
			.trim()
			.min(Configuration.get('user.passwordMinLength') as number, {
				message:
					translations[
						'account-password-update.validation.password_new_min'
					],
			})
			.refine((value) => /[A-Z]/.test(value), {
				message:
					translations[
						'account-password-update.validation.password_new_condition_capital_letter'
					],
			})
			.refine((value) => /[0-9]/.test(value), {
				message:
					translations[
						'account-password-update.validation.password_new_condition_number'
					],
			})
			.refine((value) => /[!@#$%^&*()_+{}[\]:;<>,.?~\\/-]/.test(value), {
				message:
					translations[
						'account-password-update.validation.password_new_condition_special_character'
					],
			}),
		password_confirm: z
			.string({
				message:
					translations[
						'account-password-update.validation.password_confirm_required'
					],
			})
			.trim()
			.nonempty({
				message:
					translations[
						'account-password-update.validation.password_confirm_required'
					],
			}),
	})
	.superRefine(({ password_new, password_confirm }, ctx) => {
		if (password_new !== password_confirm) {
			ctx.addIssue({
				path: ['password_confirm'],
				message:
					translations[
						'account-password-update.validation.password_confirm_mismatch'
					],
				code: 'custom',
			});
		}
	});
