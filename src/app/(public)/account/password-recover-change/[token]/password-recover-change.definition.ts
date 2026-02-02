import { z } from 'zod';
import { translateBatch } from '@/config/lang';
import { Configuration } from '@/config/settings.config';
import type { FormSituationType } from '@/types';

export type PasswordRecoverChangeFormFieldsType = {
	password: string;
	password_confirm: string;
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

const translations = await translateBatch([
	'password_recover_change.validation.password_invalid',
	{
		key: 'password_recover_change.validation.password_min',
		vars: {
			min: Configuration.get('user.passwordMinLength') as string,
		},
	},
	'password_recover_change.validation.password_condition_capital_letter',
	'password_recover_change.validation.password_condition_number',
	'password_recover_change.validation.password_condition_special_character',
	'password_recover_change.validation.password_confirm_required',
	'password_recover_change.validation.password_confirm_mismatch',
]);

export const PasswordRecoverChangeSchema = z
	.object({
		password: z
			.string({
				message:
					translations[
						'password_recover_change.validation.password_invalid'
					],
			})
			.trim()
			.min(Configuration.get('user.passwordMinLength') as number, {
				message:
					translations[
						'password_recover_change.validation.password_min'
					],
			})
			.refine((value) => /[A-Z]/.test(value), {
				message:
					translations[
						'password_recover_change.validation.password_condition_capital_letter'
					],
			})
			.refine((value) => /[0-9]/.test(value), {
				message:
					translations[
						'password_recover_change.validation.password_condition_number'
					],
			})
			.refine((value) => /[!@#$%^&*()_+{}[\]:;<>,.?~\\/-]/.test(value), {
				message:
					translations[
						'password_recover_change.validation.password_condition_special_character'
					],
			}),
		password_confirm: z
			.string({
				message:
					translations[
						'password_recover_change.validation.password_confirm_required'
					],
			})
			.trim()
			.nonempty({
				message:
					translations[
						'password_recover_change.validation.password_confirm_required'
					],
			}),
	})
	.superRefine(({ password, password_confirm }, ctx) => {
		if (password !== password_confirm) {
			ctx.addIssue({
				path: ['password_confirm'],
				message:
					translations[
						'password_recover_change.validation.password_confirm_mismatch'
					],
				code: 'custom',
			});
		}
	});
