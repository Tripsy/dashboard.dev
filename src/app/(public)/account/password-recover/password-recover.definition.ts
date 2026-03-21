import { z } from 'zod';
import { translateBatch } from '@/config/translate.setup';
import { BaseValidator } from '@/helpers/validator.helper';
import type { FormSituationType } from '@/types/form.type';

export type PasswordRecoverFormFieldsType = {
	email?: string;
};

export type PasswordRecoverSituationType = FormSituationType | 'csrf_error';

export type PasswordRecoverStateType = {
	values: PasswordRecoverFormFieldsType;
	errors: Partial<Record<keyof PasswordRecoverFormFieldsType, string[]>>;
	message: string | null;
	situation: PasswordRecoverSituationType;
};

export const PasswordRecoverState: PasswordRecoverStateType = {
	values: {
		email: '',
	},
	errors: {},
	message: null,
	situation: null,
};

const translationValidation = await translateBatch(
	['password-recover.validation.invalid_email'],
	'password-recover.validation.',
);

class PasswordRecoverValidator extends BaseValidator {
	constructor(private readonly message: Record<string, string>) {
		super();
	}

	passwordRecover() {
		return z.object({
			email: this.validateEmail(this.message.invalid_email),
		});
	}
}

export const PasswordRecoverSchema = new PasswordRecoverValidator(
	translationValidation,
).passwordRecover();
