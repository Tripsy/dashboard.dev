import { z } from 'zod';
import { translateBatch } from '@/config/translate.setup';
import { getFormDataAsString } from '@/helpers/form.helper';
import { BaseValidator } from '@/helpers/validator.helper';
import type { FormErrorsType, FormSituationType } from '@/types/form.type';

export type EmailUpdateFormValuesType = {
	email_new: string | null;
};

export type EmailUpdateSituationType = FormSituationType | 'csrfError';

export type EmailUpdateStateType = {
	values: EmailUpdateFormValuesType;
	errors: FormErrorsType<EmailUpdateFormValuesType>;
	message: string | null;
	situation: EmailUpdateSituationType;
};

export const EmailUpdateState: EmailUpdateStateType = {
	values: {
		email_new: '',
	},
	errors: {},
	message: null,
	situation: null,
};

const validatorMessages = ['invalid_email'] as const;

class EmailUpdateValidator extends BaseValidator<typeof validatorMessages> {
	emailUpdate = z.object({
		email_new: this.validateEmail(this.getMessage('invalid_email')),
	});
}

export async function validateFormEmailUpdate(
	values: EmailUpdateFormValuesType,
) {
	const translations = await translateBatch(
		validatorMessages,
		'email-update.validation',
	);

	const validator = new EmailUpdateValidator(translations);

	return validator.emailUpdate.safeParse(values);
}

export function getEmailUpdateFormValues(
	formData: FormData,
): EmailUpdateFormValuesType {
	return {
		email_new: getFormDataAsString(formData, 'email_new'),
	};
}
