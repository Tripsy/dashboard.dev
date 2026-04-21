import { z } from 'zod';
import { getFormDataAsString } from '@/helpers/form.helper';
import { BaseValidator } from '@/helpers/validator.helper';
import type { FormErrorsType, FormSituationType } from '@/types/form.type';

export type PasswordRecoverFormValuesType = {
	email: string | null;
};

export type PasswordRecoverSituationType = FormSituationType | 'csrf_error';

export type PasswordRecoverStateType = {
	values: PasswordRecoverFormValuesType;
	errors: FormErrorsType<PasswordRecoverFormValuesType>;
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

export function validateFormPasswordRecover(
	values: PasswordRecoverFormValuesType,
) {
	const validator = new PasswordRecoverValidator(validatorMessages);

	return validator.passwordRecover.safeParse(values);
}

export function getPasswordRecoverFormValues(
	formData: FormData,
): PasswordRecoverFormValuesType {
	return {
		email: getFormDataAsString(formData, 'email'),
	};
}
