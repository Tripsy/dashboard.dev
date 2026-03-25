import {
	type RegisterFormFieldsType,
	RegisterSchema,
	type RegisterSituationType,
	type RegisterStateType,
} from '@/app/(public)/account/register/register.definition';
import { Configuration } from '@/config/settings.config';
import { translate } from '@/config/translate.setup';
import { ApiError } from '@/exceptions/api.error';
import {
	accumulateZodErrors,
	getFormDataAsBoolean,
	getFormDataAsEnum,
	getFormDataAsString,
} from '@/helpers/form.helper';
import { isValidCsrfToken } from '@/helpers/session.helper';
import { LANGUAGE_DEFAULT, LanguageEnum } from '@/models/user.model';
import { registerAccount } from '@/services/account.service';

export function registerFormValues(formData: FormData): RegisterFormFieldsType {
	return {
		name: getFormDataAsString(formData, 'name'),
		email: getFormDataAsString(formData, 'email'),
		password: getFormDataAsString(formData, 'password'),
		password_confirm: getFormDataAsString(formData, 'password_confirm'),
		language:
			getFormDataAsEnum(formData, 'language', LanguageEnum) ||
			LANGUAGE_DEFAULT,
		terms: getFormDataAsBoolean(formData, 'terms'),
	};
}

export function registerValidate(values: RegisterFormFieldsType) {
	return RegisterSchema.safeParse(values);
}

export async function registerAction(
	state: RegisterStateType,
	formData: FormData,
): Promise<RegisterStateType> {
	const values = registerFormValues(formData);
	const validated = registerValidate(values);

	const result: RegisterStateType = {
		...state, // Spread existing state
		values, // Override with new values
		message: null,
		situation: null,
	};

	const csrfToken = getFormDataAsString(
		formData,
		Configuration.get('csrf.inputName') as string,
	);

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
			errors: accumulateZodErrors<RegisterFormFieldsType>(
				validated.error,
			),
		};
	}

	try {
		const fetchResponse = await registerAccount(validated.data);

		return {
			...result,
			errors: {},
			message: fetchResponse?.message || null,
			situation: fetchResponse?.success ? 'success' : 'error',
		};
	} catch (error: unknown) {
		let message: string = '';
		let situation: RegisterSituationType = 'error';

		if (error instanceof ApiError) {
			switch (error.status) {
				case 409:
					situation = 'pending_account';
					message = await translate(
						'register.message.pending_account',
					);
					break;
			}
		}

		return {
			...result,
			errors: {},
			message: message || (await translate('app.error.form')),
			situation: situation,
		};
	}
}
