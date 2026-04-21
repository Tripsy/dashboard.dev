import {
	getLoginFormValues,
	type LoginApiResponseType,
	type LoginFormValuesType,
	type LoginSituationType,
	type LoginStateType,
	validateFormLogin,
} from '@/app/(public)/account/login/login.definition';
import { translate } from '@/config/translate.setup';
import { ApiError } from '@/exceptions/api.error';
import { accumulateZodErrors } from '@/helpers/form.helper';
import { isValidCsrfToken } from '@/helpers/session.helper';
import { requestLogin } from '@/services/account.service';
import { createAuth } from '@/services/auth.service';

export async function loginAction(
	formState: LoginStateType,
	formData: FormData,
): Promise<LoginStateType> {
	if (!(await isValidCsrfToken(formData))) {
		return {
			...formState,
			message: await translate('app.error.csrf'),
			situation: 'csrf_error',
		};
	}

	const formValues = getLoginFormValues(formData);
	const validated = validateFormLogin(formValues);

	if (!validated.success) {
		const errors = accumulateZodErrors<LoginFormValuesType>(
			validated.error,
		);

		return {
			...formState,
			values: formValues,
			situation: 'error',
			message: await translate('app.error.validation'),
			errors,
		};
	}

	try {
		const requestResponse = await requestLogin(validated.data);

		if (
			requestResponse?.success &&
			requestResponse.data &&
			'token' in requestResponse.data
		) {
			const authResponse = await createAuth(requestResponse.data.token);

			return {
				...formState,
				values: validated.data,
				message: authResponse?.message || null,
				situation: authResponse?.success ? 'success' : 'error',
			};
		} else {
			return {
				...formState,
				values: validated.data,
				message: requestResponse?.message || null,
				situation: 'error',
			};
		}
	} catch (error: unknown) {
		let message: string = '';
		let situation: LoginSituationType = 'error';
		let resultData: LoginApiResponseType | undefined;

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
					resultData = error.body?.data;
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
			...formState,
			values: validated.data,
			message:
				message || (await translate('login.message.could_not_login')),
			situation: situation,
			resultData: resultData,
		};
	}
}
