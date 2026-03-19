import { z } from 'zod';
import { translateBatch } from '@/config/translate.setup';
import { validateString } from '@/helpers/form.helper';
import type { AuthTokenListType } from '@/types/auth.type';
import type { FormSituationType } from '@/types/form.type';

export type LoginFormFieldsType = {
	email: string;
	password: string;
};

export type LoginSituationType =
	| FormSituationType
	| 'csrf_error'
	| 'max_active_sessions'
	| 'pending_account';

export type LoginStateType = {
	values: LoginFormFieldsType;
	errors: Partial<Record<keyof LoginFormFieldsType, string[]>>;
	message: string | null;
	situation: LoginSituationType;
	body?: { authValidTokens: AuthTokenListType };
};

export const LoginState: LoginStateType = {
	values: {
		email: '',
		password: '',
	},
	errors: {},
	message: null,
	situation: null,
};

const translations = await translateBatch([
	'login.validation.email_invalid',
	'login.validation.password',
]);

export const LoginSchema = z.object({
	email: z.email({ message: translations['login.validation.email_invalid'] }),
	password: validateString(translations['login.validation.password']),
});
