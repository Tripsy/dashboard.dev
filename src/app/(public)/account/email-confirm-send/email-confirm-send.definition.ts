import { z } from 'zod';
import { getFormDataAsString } from '@/helpers/form.helper';
import { BaseValidator } from '@/helpers/validator.helper';
import type { FormErrorsType, FormSituationType } from '@/types/form.type';

export type EmailConfirmSendFormValuesType = {
	email: string | null;
};

export type EmailConfirmSendSituationType = FormSituationType | 'csrf_error';

export type EmailConfirmSendStateType = {
	values: EmailConfirmSendFormValuesType;
	errors: FormErrorsType<EmailConfirmSendFormValuesType>;
	message: string | null;
	situation: EmailConfirmSendSituationType;
};

export const EmailConfirmSendState: EmailConfirmSendStateType = {
	values: {
		email: '',
	},
	errors: {},
	message: null,
	situation: null,
};

const validatorMessages = await BaseValidator.getValidatorMessages(
	['invalid_email'] as const,
	'email-confirm-send.validation',
);

class EmailConfirmSendValidator extends BaseValidator<
	typeof validatorMessages
> {
	emailConfirmSend = z.object({
		email: this.validateEmail(this.getMessage('invalid_email')),
	});
}

export function validateFormEmailConfirmSend(
	values: EmailConfirmSendFormValuesType,
) {
	const validator = new EmailConfirmSendValidator(validatorMessages);

	return validator.emailConfirmSend.safeParse(values);
}

export function getEmailConfirmSendFormValues(
	formData: FormData,
): EmailConfirmSendFormValuesType {
	return {
		email: getFormDataAsString(formData, 'email'),
	};
}
