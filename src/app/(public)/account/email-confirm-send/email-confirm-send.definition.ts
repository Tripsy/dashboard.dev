import { z } from 'zod';
import { translateBatch } from '@/config/translate.setup';
import {FormSituationType} from "@/types/form.type";

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

const translations = await translateBatch([
	'email-confirm-send.validation.email_invalid',
]);

export const EmailConfirmSendSchema = z.object({
	email: z.email({
		message: translations['email-confirm-send.validation.email_invalid'],
	}),
});
