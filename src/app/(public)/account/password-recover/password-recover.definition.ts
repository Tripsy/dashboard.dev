import { z } from 'zod';
import { BaseValidator } from '@/helpers/validator.helper';
import type { FormSituationType } from '@/types/form.type';

export type PasswordRecoverFormFieldsType = {
	email: string | null;
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

const validatorMessages = await BaseValidator.getValidatorMessages(
	['invalid_email'] as const,
	'password-recover.validation',
);

class PasswordRecoverValidator extends BaseValidator<typeof validatorMessages> {
	passwordRecover = z.object({
		email: this.validateEmail(this.getMessage('invalid_email')),
	});
}

export const PasswordRecoverSchema = new PasswordRecoverValidator(
	validatorMessages,
).passwordRecover;
