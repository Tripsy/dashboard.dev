import {
	type AccountEditFormFieldsType,
	AccountEditSchema,
	type AccountEditStateType,
} from '@/app/(public)/account/edit/account-edit.definition';
import { Configuration } from '@/config/settings.config';
import { translate } from '@/config/translate.setup';
import {
	accumulateZodErrors,
	getFormDataAsEnum,
	getFormDataAsString,
} from '@/helpers/form.helper';
import { isValidCsrfToken } from '@/helpers/session.helper';
import { LANGUAGE_DEFAULT, LanguageEnum } from '@/models/user.model';
import { editAccount } from '@/services/account.service';

export function accountEditFormValues(
	formData: FormData,
): AccountEditFormFieldsType {
	return {
		name: getFormDataAsString(formData, 'name'),
		language:
			getFormDataAsEnum(formData, 'language', LanguageEnum) ||
			LANGUAGE_DEFAULT,
	};
}

export function accountEditValidate(values: AccountEditFormFieldsType) {
	return AccountEditSchema.safeParse(values);
}

export async function accountEditAction(
	state: AccountEditStateType,
	formData: FormData,
): Promise<AccountEditStateType> {
	const values = accountEditFormValues(formData);
	const validated = accountEditValidate(values);

	const result: AccountEditStateType = {
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
			errors: accumulateZodErrors<AccountEditFormFieldsType>(
				validated.error,
			),
		};
	}

	try {
		const fetchResponse = await editAccount(validated.data);

		return {
			...result,
			errors: {},
			message: fetchResponse?.message || null,
			situation: fetchResponse?.success ? 'success' : 'error',
		};
	} catch {
		return {
			...result,
			errors: {},
			message: await translate('app.error.form'),
			situation: 'error',
		};
	}
}
