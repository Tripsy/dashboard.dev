import {
	type RegisterFormFieldsType,
	RegisterSchema,
	type RegisterSituationType,
	type RegisterStateType,
} from '@/app/(public)/account/register/register.definition';
import { translate } from '@/config/lang';
import { Configuration } from '@/config/settings.config';
import { ApiError } from '@/exceptions/api.error';
import { accumulateZodErrors } from '@/helpers/form.helper';
import { isValidCsrfToken } from '@/helpers/session.helper';
import { LanguageEnum } from '@/models/user.model';
import { registerAccount } from '@/services/account.service';

export function registerFormValues(formData: FormData): RegisterFormFieldsType {
	const language = formData.get('language');
	const validLanguages = Object.values(LanguageEnum);

	return {
		name: formData.get('name') as string,
		email: formData.get('email') as string,
		password: formData.get('password') as string,
		password_confirm: formData.get('password_confirm') as string,
		language: validLanguages.includes(language as LanguageEnum)
			? (language as LanguageEnum)
			: LanguageEnum.EN,
		terms: formData.get('terms') === 'on',
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
