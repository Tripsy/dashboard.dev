import {
	getRegisterFormValues,
	type RegisterFormValuesType,
	type RegisterSituationType,
	type RegisterStateType,
	validateFormRegister,
} from '@/app/(public)/account/register/register.definition';
import { translate } from '@/config/translate.setup';
import { ApiError } from '@/exceptions/api.error';
import { accumulateZodErrors } from '@/helpers/form.helper';
import { isValidCsrfToken } from '@/helpers/session.helper';
import { requestRegister } from '@/services/account.service';

export async function registerAction(
	formState: RegisterStateType,
	formData: FormData,
): Promise<RegisterStateType> {
	if (!(await isValidCsrfToken(formData))) {
		return {
			...formState,
			message: await translate('app.error.csrf'),
			situation: 'csrf_error',
		};
	}

	const formValues = getRegisterFormValues(formData);
	const validated = validateFormRegister(formValues);

	if (!validated.success) {
		const errors = accumulateZodErrors<RegisterFormValuesType>(
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
		const requestResponse = await requestRegister(validated.data);

		return {
			...formState,
			values: validated.data,
			message: requestResponse?.message || null,
			situation: requestResponse?.success ? 'success' : 'error',
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
			...formState,
			values: validated.data,
			errors: {},
			message: message || (await translate('app.error.form')),
			situation: situation,
		};
	}
}
