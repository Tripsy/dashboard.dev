import { z } from 'zod';
import { Configuration } from '@/config/settings.config';
import { translateBatch } from '@/config/translate.setup';
import {FormSituationType} from "@/types/form.type";

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
	'password-recover-change.validation.password_invalid',
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
]);

export const PasswordRecoverChangeSchema = z
	.object({
		password: z
			.string({
				message:
					translations[
						'password-recover-change.validation.password_invalid'
					],
			})
			.trim()
			.min(Configuration.get('user.passwordMinLength') as number, {
				message:
					translations[
						'password-recover-change.validation.password_min'
					],
			})
			.refine((value) => /[A-Z]/.test(value), {
				message:
					translations[
						'password-recover-change.validation.password_condition_capital_letter'
					],
			})
			.refine((value) => /[0-9]/.test(value), {
				message:
					translations[
						'password-recover-change.validation.password_condition_number'
					],
			})
			.refine((value) => /[!@#$%^&*()_+{}[\]:;<>,.?~\\/-]/.test(value), {
				message:
					translations[
						'password-recover-change.validation.password_condition_special_character'
					],
			}),
		password_confirm: z
			.string({
				message:
					translations[
						'password-recover-change.validation.password_confirm_required'
					],
			})
			.trim()
			.nonempty({
				message:
					translations[
						'password-recover-change.validation.password_confirm_required'
					],
			}),
	})
	.superRefine(({ password, password_confirm }, ctx) => {
		if (password !== password_confirm) {
			ctx.addIssue({
				path: ['password_confirm'],
				message:
					translations[
						'password-recover-change.validation.password_confirm_mismatch'
					],
				code: 'custom',
			});
		}
	});
