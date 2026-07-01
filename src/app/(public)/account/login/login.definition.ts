import { z } from 'zod';
import { translateBatch } from '@/config/translate.setup';
import { getFormDataAsString } from '@/helpers/form.helper';
import { BaseValidator } from '@/helpers/validator.helper';
import type { AuthTokenType } from '@/types/auth.type';
import type { FormErrorsType, FormSituationType } from '@/types/form.type';

export type LoginFormValuesType = {
	email: string | null;
	password: string | null;
};

export type LoginSituationType =
	| FormSituationType
	| 'csrfError'
	| 'maxActiveSession'
	| 'pendingAccount';

export type LoginApiResponseType =
	| { token: string }
	| { authTokens: AuthTokenType[] };

export type LoginStateType = {
	values: LoginFormValuesType;
	errors: FormErrorsType<LoginFormValuesType>;
	message: string | null;
	situation: LoginSituationType;
	resultData?: LoginApiResponseType;
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

const validatorMessages = ['invalid_email', 'invalid_password'] as const;

class LoginValidator extends BaseValidator<typeof validatorMessages> {
	login = z.object({
		email: this.validateEmail(this.getMessage('invalid_email')),
		password: this.validateString(this.getMessage('invalid_password')),
	});
}

export async function validateFormLogin(values: LoginFormValuesType) {
	const translations = await translateBatch(
		validatorMessages,
		'login.validation',
	);

	const validator = new LoginValidator(translations);

	return validator.login.safeParse(values);
}

export function getLoginFormValues(formData: FormData): LoginFormValuesType {
	return {
		email: getFormDataAsString(formData, 'email'),
		password: getFormDataAsString(formData, 'password'),
	};
}

export const isLoginResponseMaxActiveSessions = (
	response: LoginApiResponseType,
): response is { authTokens: AuthTokenType[] } => {
	return 'authTokens' in response;
};

export const isLoginResponseSuccess = (
	response: LoginApiResponseType,
): response is { token: string } => {
	return 'token' in response;
};
