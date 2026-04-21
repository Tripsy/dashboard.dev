import {
	type AccountEditFormValuesType,
	type AccountEditStateType,
	getAccountEditFormValues,
	validateFormAccountEdit,
} from '@/app/(public)/account/edit/account-edit.definition';
import { translate } from '@/config/translate.setup';
import { accumulateZodErrors } from '@/helpers/form.helper';
import { isValidCsrfToken } from '@/helpers/session.helper';
import { requestEditAccount } from '@/services/account.service';

export async function accountEditAction(
	formState: AccountEditStateType,
	formData: FormData,
): Promise<AccountEditStateType> {
	if (!(await isValidCsrfToken(formData))) {
		return {
			...formState,
			message: await translate('app.error.csrf'),
			situation: 'csrf_error',
		};
	}

	const formValues = getAccountEditFormValues(formData);
	const validated = validateFormAccountEdit(formValues);

	if (!validated.success) {
		const errors = accumulateZodErrors<AccountEditFormValuesType>(
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
		const requestResponse = await requestEditAccount(validated.data);

		return {
			...formState,
			values: validated.data,
			message: requestResponse?.message || null,
			situation: requestResponse?.success ? 'success' : 'error',
		};
	} catch {
		return {
			...formState,
			values: validated.data,
			message: await translate('app.error.form'),
			situation: 'error',
		};
	}
}
