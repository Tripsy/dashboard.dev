import { z } from 'zod';
import { translateBatch } from '@/config/translate.setup';
import { BaseValidator } from '@/helpers/validator.helper';
import type { FormSituationType } from '@/types/form.type';

export type EmailConfirmSendFormFieldsType = {
	email: string;
};

export type EmailConfirmSendSituationType = FormSituationType | 'csrf_error';

export type EmailConfirmSendStateType = {
	values: EmailConfirmSendFormFieldsType;
	errors: Partial<Record<keyof EmailConfirmSendFormFieldsType, string[]>>;
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

const validatorMessages = await translateBatch(
	['email-confirm-send.validation.invalid_email'],
	'email-confirm-send.validation.',
);

class EmailConfirmSendValidator extends BaseValidator<
	typeof validatorMessages
> {
	emailConfirmSend() {
		return z.object({
			email: this.validateEmail(this.getMessage('invalid_email')),
		});
	}
}

export const EmailConfirmSendSchema = new EmailConfirmSendValidator(
	validatorMessages,
).emailConfirmSend();
