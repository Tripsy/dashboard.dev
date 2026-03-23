import { z } from 'zod';
import { BaseValidator } from '@/helpers/validator.helper';
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

const validatorMessages = await BaseValidator.getValidatorMessages(
	['invalid_email', 'invalid_password'] as const,
	'login.validation',
);

class LoginValidator extends BaseValidator<typeof validatorMessages> {
	login = z.object({
		email: this.validateEmail(this.getMessage('invalid_email')),
		password: this.validateString(this.getMessage('invalid_password')),
	});
}

export const LoginSchema = new LoginValidator(validatorMessages).login;
