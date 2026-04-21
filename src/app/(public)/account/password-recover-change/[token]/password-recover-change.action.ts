import {
	getPasswordRecoverChangeFormValues,
	type PasswordRecoverChangeFormValuesType,
	type PasswordRecoverChangeSituationType,
	type PasswordRecoverChangeStateType,
	validateFormPasswordRecoverChange,
} from '@/app/(public)/account/password-recover-change/[token]/password-recover-change.definition';
import { translate } from '@/config/translate.setup';
import { ApiError } from '@/exceptions/api.error';
import { accumulateZodErrors } from '@/helpers/form.helper';
import { isValidCsrfToken } from '@/helpers/session.helper';
import { requestPasswordRecoverChange } from '@/services/account.service';

export async function passwordRecoverChangeAction(
	formState: PasswordRecoverChangeStateType,
	formData: FormData,
): Promise<PasswordRecoverChangeStateType> {
	if (!(await isValidCsrfToken(formData))) {
		return {
			...formState,
			message: await translate('app.error.csrf'),
			situation: 'csrf_error',
		};
	}

	const formValues = getPasswordRecoverChangeFormValues(formData);
	const validated = validateFormPasswordRecoverChange(formValues);

	if (!validated.success) {
		const errors = accumulateZodErrors<PasswordRecoverChangeFormValuesType>(
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
		const requestResponse = await requestPasswordRecoverChange(
			validated.data,
			formState.token,
		);

		return {
			...formState,
			values: validated.data,
			message: requestResponse?.message || null,
			situation: requestResponse?.success ? 'success' : 'error',
		};
	} catch (error: unknown) {
		let message: string = '';
		const situation: PasswordRecoverChangeSituationType = 'error';

		if (error instanceof ApiError) {
			message = error.message;
		}

		return {
			...formState,
			values: validated.data,
			message:
				message ||
				(await translate('password-recover-change.message.failed')),
			situation: situation,
		};
	}
}
