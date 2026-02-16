import { z } from 'zod';
import { Configuration } from '@/config/settings.config';
import { translateBatch } from '@/config/translate.setup';
import { LanguageEnum } from '@/models/user.model';
import {FormSituationType} from "@/types/form.type";

export type RegisterFormFieldsType = {
	name: string;
	email: string;
	password: string;
	password_confirm: string;
	language: LanguageEnum;
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

const translations = await translateBatch([
	'register.validation.name_invalid',
	{
		key: 'register.validation.name_min',
		vars: {
			min: Configuration.get('user.nameMinLength') as string,
		},
	},
	'register.validation.email_invalid',
	'register.validation.password_invalid',
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
	'register.validation.language_invalid',
	'register.validation.terms_required',
]);

export const RegisterSchema = z
	.object({
		name: z
			.string({
				message: translations['register.validation.name_invalid'],
			})
			.trim()
			.min(Configuration.get('user.nameMinLength') as number, {
				message: translations['register.validation.name_min'],
			}),
		email: z.email({
			message: translations['register.validation.email_invalid'],
		}),
		password: z
			.string({
				message: translations['register.validation.password_invalid'],
			})
			.trim()
			.min(Configuration.get('user.passwordMinLength') as number, {
				message: translations['register.validation.password_min'],
			})
			.refine((value) => /[A-Z]/.test(value), {
				message:
					translations[
						'register.validation.password_condition_capital_letter'
					],
			})
			.refine((value) => /[0-9]/.test(value), {
				message:
					translations[
						'register.validation.password_condition_number'
					],
			})
			.refine((value) => /[!@#$%^&*()_+{}[\]:;<>,.?~\\/-]/.test(value), {
				message:
					translations[
						'register.validation.password_condition_special_character'
					],
			}),
		password_confirm: z
			.string({
				message:
					translations[
						'register.validation.password_confirm_required'
					],
			})
			.trim()
			.nonempty({
				message:
					translations[
						'register.validation.password_confirm_required'
					],
			}),
		language: z.enum(LanguageEnum, {
			message: translations['register.validation.language_invalid'],
		}),
		terms: z.boolean().refine((val) => val === true, {
			message: translations['register.validation.terms_required'],
		}),
	})
	.superRefine(({ password, password_confirm }, ctx) => {
		if (password !== password_confirm) {
			ctx.addIssue({
				path: ['password_confirm'],
				message:
					translations[
						'register.validation.password_confirm_mismatch'
					],
				code: 'custom',
			});
		}
	});
