import { z } from 'zod';
import { getFormDataAsString } from '@/helpers/form.helper';
import { BaseValidator } from '@/helpers/validator.helper';
import type { FormErrorsType, FormSituationType } from '@/types/form.type';

export type EmailUpdateFormValuesType = {
	email_new: string | null;
};

export type EmailUpdateSituationType = FormSituationType | 'csrf_error';

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

const validatorMessages = await BaseValidator.getValidatorMessages(
	['invalid_email'] as const,
	'account-email-update.validation',
);

class EmailUpdateValidator extends BaseValidator<typeof validatorMessages> {
	emailUpdate = z.object({
		email_new: this.validateEmail(this.getMessage('invalid_email')),
	});
}

export function validateFormEmailUpdate(values: EmailUpdateFormValuesType) {
	const validator = new EmailUpdateValidator(validatorMessages);

	return validator.emailUpdate.safeParse(values);
}

export function getEmailUpdateFormValues(
	formData: FormData,
): EmailUpdateFormValuesType {
	return {
		email_new: getFormDataAsString(formData, 'email_new'),
	};
}
