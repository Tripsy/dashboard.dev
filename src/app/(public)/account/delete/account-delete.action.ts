import {
	type AccountDeleteFormFieldsType,
	AccountDeleteSchema,
	type AccountDeleteSituationType,
	type AccountDeleteStateType,
} from '@/app/(public)/account/delete/account-delete.definition';
import { Configuration } from '@/config/settings.config';
import { translate } from '@/config/translate.setup';
import { ApiError } from '@/exceptions/api.error';
import { accumulateZodErrors } from '@/helpers/form.helper';
import { isValidCsrfToken } from '@/helpers/session.helper';
import { deleteAccount } from '@/services/account.service';

export function accountDeleteFormValues(
	formData: FormData,
): AccountDeleteFormFieldsType {
	return {
		password_current: formData.get('password_current') as string,
	};
}

export function accountDeleteValidate(values: AccountDeleteFormFieldsType) {
	return AccountDeleteSchema.safeParse(values);
}

export async function accountDeleteAction(
	state: AccountDeleteStateType,
	formData: FormData,
): Promise<AccountDeleteStateType> {
	const values = accountDeleteFormValues(formData);
	const validated = accountDeleteValidate(values);

	const result: AccountDeleteStateType = {
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
			errors: accumulateZodErrors<AccountDeleteFormFieldsType>(
				validated.error,
			),
		};
	}

	try {
		const fetchResponse = await deleteAccount(validated.data);

		return {
			...result,
			errors: {},
			message: fetchResponse?.message || null,
			situation: fetchResponse?.success ? 'success' : 'error',
		};
	} catch (error: unknown) {
		let message: string = '';
		const situation: AccountDeleteSituationType = 'error';

		if (error instanceof ApiError) {
			switch (error.status) {
				case 401:
					message = await translate(
						'account_delete.validation.password_current_incorrect',
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
