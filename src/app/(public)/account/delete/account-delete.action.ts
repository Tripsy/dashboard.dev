import {
	type AccountDeleteFormValuesType,
	type AccountDeleteSituationType,
	type AccountDeleteStateType,
	getAccountDeleteFormValues,
	validateFormAccountDelete,
} from '@/app/(public)/account/delete/account-delete.definition';
import { translate } from '@/config/translate.setup';
import { ApiError } from '@/exceptions/api.error';
import { accumulateZodErrors } from '@/helpers/form.helper';
import { isValidCsrfToken } from '@/helpers/session.helper';
import { requestDeleteAccount } from '@/services/account.service';

export async function accountDeleteAction(
	formState: AccountDeleteStateType,
	formData: FormData,
): Promise<AccountDeleteStateType> {
	if (!(await isValidCsrfToken(formData))) {
		return {
			...formState,
			message: await translate('app.error.csrf'),
			situation: 'csrf_error',
		};
	}

	const formValues = getAccountDeleteFormValues(formData);
	const validated = validateFormAccountDelete(formValues);

	if (!validated.success) {
		const errors = accumulateZodErrors<AccountDeleteFormValuesType>(
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
		const requestResponse = await requestDeleteAccount(validated.data);

		return {
			...formState,
			values: validated.data,
			message: requestResponse?.message || null,
			situation: requestResponse?.success ? 'success' : 'error',
		};
	} catch (error: unknown) {
		let message: string = '';
		const situation: AccountDeleteSituationType = 'error';

		if (error instanceof ApiError) {
			switch (error.status) {
				case 401:
					message = await translate(
						'account-delete.error.password_current_incorrect',
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
