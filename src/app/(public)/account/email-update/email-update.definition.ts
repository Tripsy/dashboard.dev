import { z } from 'zod';
import { translateBatch } from '@/config/translate.setup';
import {FormSituationType} from "@/types/form.type";

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

const translations = await translateBatch([
	'account-email-update.validation.email_invalid',
]);

export const EmailUpdateSchema = z.object({
	email_new: z.email({
		message: translations['account-email-update.validation.email_invalid'],
	}),
});
