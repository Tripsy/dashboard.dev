import { z } from 'zod';
import { translateBatch } from '@/config/translate.setup';
import {FormSituationType} from "@/types/form.type";

export type PasswordRecoverFormFieldsType = {
	email: string;
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

const translations = await translateBatch([
	'password-recover.validation.email_invalid',
]);

export const PasswordRecoverSchema = z.object({
	email: z.email({
		message: translations['password-recover.validation.email_invalid'],
	}),
});
