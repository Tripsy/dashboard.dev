import { z } from 'zod';
import { BaseValidator } from '@/helpers/validator.helper';
import type { FormSituationType } from '@/types/form.type';

export type EmailUpdateFormFieldsType = {
	email_new: string;
};

export type EmailUpdateSituationType = FormSituationType | 'csrf_error';

export type EmailUpdateStateType = {
	values: EmailUpdateFormFieldsType;
	errors: Partial<Record<keyof EmailUpdateFormFieldsType, string[]>>;
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

export const EmailUpdateSchema = new EmailUpdateValidator(
	validatorMessages,
).emailUpdate;
