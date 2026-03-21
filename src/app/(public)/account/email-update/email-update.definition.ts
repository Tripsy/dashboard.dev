import { z } from 'zod';
import { translateBatch } from '@/config/translate.setup';
import { BaseValidator } from '@/helpers/validator.helper';
import type { FormSituationType } from '@/types/form.type';

export type EmailUpdateFormFieldsType = {
	email_new?: string;
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

const translationValidation = await translateBatch(
	['account-email-update.validation.invalid_email'],
	'account-email-update.validation.',
);

class EmailUpdateValidator extends BaseValidator {
	constructor(private readonly message: Record<string, string>) {
		super();
	}

	emailUpdate() {
		return z.object({
			email_new: this.validateEmail(this.message.invalid_email),
		});
	}
}

export const EmailUpdateSchema = new EmailUpdateValidator(
	translationValidation,
).emailUpdate();
