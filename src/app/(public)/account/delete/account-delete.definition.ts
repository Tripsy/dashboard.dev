import { z } from 'zod';
import { translateBatch } from '@/config/translate.setup';
import { getFormDataAsString } from '@/helpers/form.helper';
import { BaseValidator } from '@/helpers/validator.helper';

// The flow itself is a `WindowForm` (see `_components/account/account.definition.ts`);
// only the validator and form-values contract still live here.
export type AccountDeleteFormValuesType = {
	password_current: string | null;
};

const validatorMessages = ['invalid_password_current'] as const;

class AccountDeleteValidator extends BaseValidator<typeof validatorMessages> {
	accountDelete = z.object({
		password_current: this.validateString(
			this.getMessage('invalid_password_current'),
		),
	});
}

export async function validateFormAccountDelete(
	values: AccountDeleteFormValuesType,
) {
	const translations = await translateBatch(
		validatorMessages,
		'account-delete.validation',
	);

	const validator = new AccountDeleteValidator(translations);

	return validator.accountDelete.safeParse(values);
}

export function getAccountDeleteFormValues(
	formData: FormData,
): AccountDeleteFormValuesType {
	return {
		password_current: getFormDataAsString(formData, 'password_current'),
	};
}
