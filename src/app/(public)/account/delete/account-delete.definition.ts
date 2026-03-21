import { z } from 'zod';
import { translateBatch } from '@/config/translate.setup';
import { BaseValidator } from '@/helpers/validator.helper';
import type { FormSituationType } from '@/types/form.type';

export type AccountDeleteFormFieldsType = {
	password_current?: string;
};

export type AccountDeleteSituationType = FormSituationType | 'csrf_error';

export type AccountDeleteStateType = {
	values: AccountDeleteFormFieldsType;
	errors: Partial<Record<keyof AccountDeleteFormFieldsType, string[]>>;
	message: string | null;
	situation: AccountDeleteSituationType;
};

export const AccountDeleteState: AccountDeleteStateType = {
	values: {
		password_current: '',
	},
	errors: {},
	message: null,
	situation: null,
};

const translationValidation = await translateBatch(
	['account-delete.validation.invalid_password'],
	'account-delete.validation.',
);

class AccountDeleteValidator extends BaseValidator {
	constructor(private readonly message: Record<string, string>) {
		super();
	}

	accountDelete() {
		return z.object({
			password_current: this.validateString(
				this.message.invalid_password_current,
			),
		});
	}
}

export const AccountDeleteSchema = new AccountDeleteValidator(
	translationValidation,
).accountDelete();
