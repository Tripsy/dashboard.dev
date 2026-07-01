import { z } from 'zod';
import { translateBatch } from '@/config/translate.setup';
import { getFormDataAsString } from '@/helpers/form.helper';
import { BaseValidator } from '@/helpers/validator.helper';
import type { FormErrorsType, FormSituationType } from '@/types/form.type';

export type EmailConfirmSendFormValuesType = {
	email: string | null;
};

export type EmailConfirmSendSituationType = FormSituationType | 'csrfError';

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

const validatorMessages = ['invalid_email'] as const;

class EmailConfirmSendValidator extends BaseValidator<
	typeof validatorMessages
> {
	emailConfirmSend = z.object({
		email: this.validateEmail(this.getMessage('invalid_email')),
	});
}

export async function validateFormEmailConfirmSend(
	values: EmailConfirmSendFormValuesType,
) {
	const translations = await translateBatch(
		validatorMessages,
		'email-confirm-send.validation',
	);

	const validator = new EmailConfirmSendValidator(translations);

	return validator.emailConfirmSend.safeParse(values);
}

export function getEmailConfirmSendFormValues(
	formData: FormData,
): EmailConfirmSendFormValuesType {
	return {
		email: getFormDataAsString(formData, 'email'),
	};
}
