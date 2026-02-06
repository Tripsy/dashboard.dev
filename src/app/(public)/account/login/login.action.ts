import {
	type LoginFormFieldsType,
	LoginSchema,
	type LoginSituationType,
	type LoginStateType,
} from '@/app/(public)/account/login/login.definition';
import { Configuration } from '@/config/settings.config';
import { translate } from '@/config/translate.setup';
import { ApiError } from '@/exceptions/api.error';
import { accumulateZodErrors } from '@/helpers/form.helper';
import { isValidCsrfToken } from '@/helpers/session.helper';
import { loginAccount } from '@/services/account.service';
import { createAuth } from '@/services/auth.service';
import type { AuthTokenListType } from '@/types/auth.type';

export function loginFormValues(formData: FormData): LoginFormFieldsType {
	return {
		email: formData.get('email') as string,
		password: formData.get('password') as string,
	};
}

export function loginValidate(values: LoginFormFieldsType) {
	return LoginSchema.safeParse(values);
}

export async function loginAction(
	state: LoginStateType,
	formData: FormData,
): Promise<LoginStateType> {
	const values = loginFormValues(formData);
	const validated = loginValidate(values);

	const result: LoginStateType = {
		...state, // Spread existing state
		values, // Override with new values
		message: null,
		situation: null,
	};

	// Check CSRF token
	const csrfToken = formData.get(
		Configuration.get('csrf.inputName') as string,
	) as string;

	if (!(await isValidCsrfToken(csrfToken))) {
		return {
			...result,
			message: await translate('app.error.csrf'),
			situation: 'csrf_error',
		};
	}

	if (!validated.success) {
		return {
			...result,
			situation: 'error',
			errors: accumulateZodErrors<LoginFormFieldsType>(validated.error),
		};
	}

	try {
		const fetchResponse = await loginAccount(validated.data);

		if (
			fetchResponse?.success &&
			fetchResponse.data &&
			'token' in fetchResponse.data
		) {
			const authResponse = await createAuth(fetchResponse.data.token);

			if (authResponse?.success) {
				return {
					...result,
					message: authResponse?.message || null,
					situation: 'success',
				};
			} else {
				return {
					...result,
					message: authResponse?.message || null,
					situation: 'error',
				};
			}
		} else {
			return {
				...result,
				message: fetchResponse?.message || null,
				situation: 'error',
			};
		}
	} catch (error: unknown) {
		let message: string = '';
		let situation: LoginSituationType = 'error';
		let responseBody: { authValidTokens: AuthTokenListType } | undefined;

		if (error instanceof ApiError) {
			switch (error.status) {
				case 400:
					message = await translate('login.message.not_active');
					break;
				case 403:
					message = await translate(
						'login.message.max_active_sessions',
					);
					situation = 'max_active_sessions';
					responseBody = error.body?.data as {
						authValidTokens: AuthTokenListType;
					};
					break;
				case 406:
					situation = 'success'; // Already logged in
					break;
				case 409:
					message = await translate('login.message.pending_account');
					situation = 'pending_account';
					break;
				case 429:
					message = await translate(
						'login.message.too_many_login_attempts',
					);
					break;
			}
		}

		return {
			...result,
			message:
				message || (await translate('login.message.could_not_login')),
			situation: situation,
			body: responseBody,
		};
	}
}
