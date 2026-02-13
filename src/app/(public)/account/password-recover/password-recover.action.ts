import {
	type PasswordRecoverFormFieldsType,
	PasswordRecoverSchema,
	type PasswordRecoverSituationType,
	type PasswordRecoverStateType,
} from '@/app/(public)/account/password-recover/password-recover.definition';
import { Configuration } from '@/config/settings.config';
import { translate } from '@/config/translate.setup';
import { ApiError } from '@/exceptions/api.error';
import { accumulateZodErrors } from '@/helpers/form.helper';
import { isValidCsrfToken } from '@/helpers/session.helper';
import { passwordRecoverAccount } from '@/services/account.service';

export function passwordRecoverFormValues(
	formData: FormData,
): PasswordRecoverFormFieldsType {
	return {
		email: formData.get('email') as string,
	};
}

export function passwordRecoverValidate(values: PasswordRecoverFormFieldsType) {
	return PasswordRecoverSchema.safeParse(values);
}

export async function passwordRecoverAction(
	state: PasswordRecoverStateType,
	formData: FormData,
): Promise<PasswordRecoverStateType> {
	const values = passwordRecoverFormValues(formData);
	const validated = passwordRecoverValidate(values);

	const result: PasswordRecoverStateType = {
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
			errors: accumulateZodErrors<PasswordRecoverFormFieldsType>(
				validated.error,
			),
		};
	}

	try {
		const fetchResponse = await passwordRecoverAccount(validated.data);

		return {
			...result,
			errors: {},
			message: fetchResponse?.message || null,
			situation: fetchResponse?.success ? 'success' : 'error',
		};
	} catch (error: unknown) {
		let message: string = '';
		const situation: PasswordRecoverSituationType = 'error';

		if (error instanceof ApiError) {
			switch (error.status) {
				case 425:
					message = await translate(
						'password-recover.message.recovery_attempts_exceeded',
					);
					break;
				case 404:
					message = await translate(
						'password-recover.message.not_active',
					);
					break;
				default:
					message = error.message;
			}
		}

		return {
			...result,
			message:
				message || (await translate('password-recover.message.failed')),
			situation: situation,
		};
	}
}
