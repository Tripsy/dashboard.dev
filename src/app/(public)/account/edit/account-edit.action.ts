import {
	type AccountEditFormFieldsType,
	AccountEditSchema,
	type AccountEditStateType,
} from '@/app/(public)/account/edit/account-edit.definition';
import { translate } from '@/config/lang';
import { Configuration } from '@/config/settings.config';
import { accumulateZodErrors } from '@/helpers/form.helper';
import { isValidCsrfToken } from '@/helpers/session.helper';
import { LanguageEnum } from '@/models/user.model';
import { editAccount } from '@/services/account.service';

export function accountEditFormValues(
	formData: FormData,
): AccountEditFormFieldsType {
	const language = formData.get('language');
	const validLanguages = Object.values(LanguageEnum);

	return {
		name: formData.get('name') as string,
		language: validLanguages.includes(language as LanguageEnum)
			? (language as LanguageEnum)
			: LanguageEnum.EN,
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
