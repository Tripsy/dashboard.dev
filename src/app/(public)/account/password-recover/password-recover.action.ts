import {
	getPasswordRecoverFormValues,
	type PasswordRecoverFormValuesType,
	type PasswordRecoverSituationType,
	type PasswordRecoverStateType,
	validateFormPasswordRecover,
} from '@/app/(public)/account/password-recover/password-recover.definition';
import { translate } from '@/config/translate.setup';
import { ApiError } from '@/exceptions/api.error';
import { accumulateZodErrors } from '@/helpers/form.helper';
import { isValidCsrfToken } from '@/helpers/session.helper';
import { requestPasswordRecover } from '@/services/account.service';

export async function passwordRecoverAction(
	formState: PasswordRecoverStateType,
	formData: FormData,
): Promise<PasswordRecoverStateType> {
	if (!(await isValidCsrfToken(formData))) {
		return {
			...formState,
			message: await translate('app.error.csrf'),
			situation: 'csrf_error',
		};
	}

	const formValues = getPasswordRecoverFormValues(formData);
	const validated = validateFormPasswordRecover(formValues);

	if (!validated.success) {
		const errors = accumulateZodErrors<PasswordRecoverFormValuesType>(
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
		const requestResponse = await requestPasswordRecover(validated.data);

		return {
			...formState,
			values: validated.data,
			message: requestResponse?.message || null,
			situation: requestResponse?.success ? 'success' : 'error',
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
			...formState,
			values: validated.data,
			message:
				message || (await translate('password-recover.message.failed')),
			situation: situation,
		};
	}
}
