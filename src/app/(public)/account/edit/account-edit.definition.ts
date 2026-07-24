import { z } from 'zod';
import { Configuration } from '@/config/settings.config';
import { translateBatch } from '@/config/translate.setup';
import { BaseValidator } from '@/helpers/validator.helper';
import type { Language } from '@/types/common.type';

// The flow itself is a `WindowForm` (see `_components/account/account.definition.ts`),
// which also owns `getFormValues`; only the validator contract still lives here.
export type AccountEditFormValuesType = {
	name: string | null;
	language: Language;
};

const validatorMessages = [
	'invalid_name',
	'name_min',
	'invalid_language',
] as const;

class AccountEditValidator extends BaseValidator<typeof validatorMessages> {
	accountEdit = z.object({
		name: this.validateString(
			{
				invalid: this.getMessage('invalid_name'),
				min_chars: this.getMessage('name_min', {
					min: Configuration.get('user.nameMinChars') as string,
				}),
			},
			{
				minChars: Configuration.get('user.nameMinChars') as number,
			},
		),
		language: this.validateLanguage(this.getMessage('invalid_language')),
	});
}

export async function validateFormAccountEdit(
	values: AccountEditFormValuesType,
) {
	const translations = await translateBatch(
		validatorMessages,
		'account-edit.validation',
	);

	const validator = new AccountEditValidator(translations);

	return validator.accountEdit.safeParse(values);
}
