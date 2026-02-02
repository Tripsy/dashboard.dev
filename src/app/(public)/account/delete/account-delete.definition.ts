import { z } from 'zod';
import { translateBatch } from '@/config/lang';
import type { FormSituationType } from '@/types';

export type AccountDeleteFormFieldsType = {
	password_current: string;
};

export type AccountDeleteSituationType = FormSituationType | 'csrf_error';

export type AccountDeleteStateType = {
	values: AccountDeleteFormFieldsType;
	errors: Partial<Record<keyof AccountDeleteFormFieldsType, string[]>>;
	message: string | null;
	situation: AccountDeleteSituationType;
};

export const AccountDeleteState: AccountDeleteStateType = {
	values: {
		password_current: '',
	},
	errors: {},
	message: null,
	situation: null,
};

const translations = await translateBatch([
	'account_delete.validation.password_current_invalid',
]);

export const AccountDeleteSchema = z.object({
	password_current: z
		.string({
			message:
				translations[
					'account_delete.validation.password_current_invalid'
				],
		})
		.trim()
		.nonempty({
			message:
				translations[
					'account_delete.validation.password_current_invalid'
				],
		}),
});
