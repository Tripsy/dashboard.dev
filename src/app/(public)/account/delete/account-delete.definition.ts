import { z } from 'zod';
import { getFormDataAsString } from '@/helpers/form.helper';
import { BaseValidator } from '@/helpers/validator.helper';
import type { FormErrorsType, FormSituationType } from '@/types/form.type';

export type AccountDeleteFormValuesType = {
	password_current: string | null;
};

export type AccountDeleteSituationType = FormSituationType | 'csrf_error';

export type AccountDeleteStateType = {
	values: AccountDeleteFormValuesType;
	errors: FormErrorsType<AccountDeleteFormValuesType>;
	message: string | null;
	situation: AccountDeleteSituationType;
};

export const AccountDeleteState: AccountDeleteStateType = {
	values: {
		password_current: '',
	},
	errors: {},
	message: null,
	situation: null,
};

const validatorMessages = await BaseValidator.getValidatorMessages(
	['invalid_password_current'] as const,
	'account-delete.validation',
);

class AccountDeleteValidator extends BaseValidator<typeof validatorMessages> {
	accountDelete = z.object({
		password_current: this.validateString(
			this.getMessage('invalid_password_current'),
		),
	});
}

export function validateFormAccountDelete(values: AccountDeleteFormValuesType) {
	const validator = new AccountDeleteValidator(validatorMessages);

	return validator.accountDelete.safeParse(values);
}

export function getAccountDeleteFormValues(
	formData: FormData,
): AccountDeleteFormValuesType {
	return {
		password_current: getFormDataAsString(formData, 'password_current'),
	};
}
