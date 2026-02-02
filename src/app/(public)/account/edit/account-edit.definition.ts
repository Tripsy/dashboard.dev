import { z } from 'zod';
import { translateBatch } from '@/config/lang';
import { Configuration } from '@/config/settings.config';
import { LanguageEnum } from '@/entities/user.model';
import type { FormSituationType } from '@/types';

export type AccountEditFormFieldsType = {
	name: string;
	language: LanguageEnum;
};

export type AccountEditSituationType = FormSituationType | 'csrf_error';

export type AccountEditStateType = {
	values: AccountEditFormFieldsType;
	errors: Partial<Record<keyof AccountEditFormFieldsType, string[]>>;
	message: string | null;
	situation: AccountEditSituationType;
};

export const AccountEditState: AccountEditStateType = {
	values: {
		name: '',
		language: LanguageEnum.RO,
	},
	errors: {},
	message: null,
	situation: null,
};

const translations = await translateBatch([
	'account_edit.validation.name_invalid',
	{
		key: 'account_edit.validation.name_min',
		vars: {
			min: Configuration.get('user.nameMinLength') as string,
		},
	},
	'account_edit.validation.language_invalid',
]);

export const AccountEditSchema = z.object({
	name: z
		.string({
			message: translations['account_edit.validation.name_invalid'],
		})
		.trim()
		.min(Configuration.get('user.nameMinLength') as number, {
			message: translations['account_edit.validation.name_min'],
		}),
	language: z.enum(LanguageEnum, {
		message: translations['account_edit.validation.language_invalid'],
	}),
});
