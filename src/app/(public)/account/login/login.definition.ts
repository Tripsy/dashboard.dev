import { z } from 'zod';
import { translateBatch } from '@/config/translate.setup';
import { BaseValidator } from '@/helpers/validator.helper';
import type { AuthTokenListType } from '@/types/auth.type';
import type { FormSituationType } from '@/types/form.type';

export type LoginFormFieldsType = {
	email?: string;
	password?: string;
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

const translationValidation = await translateBatch(
	['login.validation.invalid_email', 'login.validation.invalid_password'],
	'login.validation.',
);

class LoginValidator extends BaseValidator {
	constructor(private readonly message: Record<string, string>) {
		super();
	}

	login() {
		return z.object({
			email: this.validateEmail(this.message.invalid_email),
			password: this.validateString(this.message.invalid_password),
		});
	}
}

export const LoginSchema = new LoginValidator(translationValidation).login();
