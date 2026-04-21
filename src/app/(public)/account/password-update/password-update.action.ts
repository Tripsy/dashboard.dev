import {
	getPasswordUpdateFormValues,
	type PasswordUpdateFormValuesType,
	type PasswordUpdateSituationType,
	type PasswordUpdateStateType,
	validateFormPasswordUpdate,
} from '@/app/(public)/account/password-update/password-update.definition';
import { translate } from '@/config/translate.setup';
import { ApiError } from '@/exceptions/api.error';
import { accumulateZodErrors } from '@/helpers/form.helper';
import { isValidCsrfToken } from '@/helpers/session.helper';
import { requestPasswordUpdate } from '@/services/account.service';
import { createAuth } from '@/services/auth.service';

export async function passwordUpdateAction(
	formState: PasswordUpdateStateType,
	formData: FormData,
): Promise<PasswordUpdateStateType> {
	if (!(await isValidCsrfToken(formData))) {
		return {
			...formState,
			message: await translate('app.error.csrf'),
			situation: 'csrf_error',
		};
	}

	const formValues = getPasswordUpdateFormValues(formData);
	const validated = validateFormPasswordUpdate(formValues);

	if (!validated.success) {
		const errors = accumulateZodErrors<PasswordUpdateFormValuesType>(
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
		const requestResponse = await requestPasswordUpdate(validated.data);

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
		const situation: PasswordUpdateSituationType = 'error';

		if (error instanceof ApiError) {
			switch (error.status) {
				case 401:
					message = await translate(
						'account-password-update.error.password_current_incorrect',
					);
					break;
			}
		}

		return {
			...formState,
			values: validated.data,
			message: message || (await translate('app.error.form')),
			situation: situation,
		};
	}
}
