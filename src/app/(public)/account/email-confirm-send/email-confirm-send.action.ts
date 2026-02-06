import {
	type EmailConfirmSendFormFieldsType,
	EmailConfirmSendSchema,
	type EmailConfirmSendSituationType,
	type EmailConfirmSendStateType,
} from '@/app/(public)/account/email-confirm-send/email-confirm-send.definition';
import { Configuration } from '@/config/settings.config';
import { translate } from '@/config/translate.setup';
import { ApiError } from '@/exceptions/api.error';
import { accumulateZodErrors } from '@/helpers/form.helper';
import { isValidCsrfToken } from '@/helpers/session.helper';
import { emailConfirmSendAccount } from '@/services/account.service';

export function emailConfirmSendFormValues(
	formData: FormData,
): EmailConfirmSendFormFieldsType {
	return {
		email: formData.get('email') as string,
	};
}

export function emailConfirmSendValidate(
	values: EmailConfirmSendFormFieldsType,
) {
	return EmailConfirmSendSchema.safeParse(values);
}

export async function emailConfirmSendAction(
	state: EmailConfirmSendStateType,
	formData: FormData,
): Promise<EmailConfirmSendStateType> {
	const values = emailConfirmSendFormValues(formData);
	const validated = emailConfirmSendValidate(values);

	const result: EmailConfirmSendStateType = {
		...state, // Spread existing state
		values, // Override with new values
		message: null,
		situation: null,
	};

	// Check CSRF token
	const csrfToken = formData.get(
		Configuration.get('csrf.inputName') as string,
	) as string;

	if (!(await isValidCsrfToken(csrfToken))) {
		return {
			...result,
			message: await translate('app.error.csrf'),
			situation: 'csrf_error',
		};
	}

	if (!validated.success) {
		return {
			...result,
			situation: 'error',
			errors: accumulateZodErrors<EmailConfirmSendFormFieldsType>(
				validated.error,
			),
		};
	}

	try {
		const fetchResponse = await emailConfirmSendAccount(validated.data);

		return {
			...result,
			errors: {},
			message: fetchResponse?.message || null,
			situation: fetchResponse?.success ? 'success' : 'error',
		};
	} catch (error: unknown) {
		let message: string = '';
		const situation: EmailConfirmSendSituationType = 'error';

		if (error instanceof ApiError) {
			switch (error.status) {
				case 403:
					message = await translate(
						'email_confirm_send.message.not_allowed',
					);
					break;
				case 404:
					message = await translate(
						'email_confirm_send.message.not_active',
					);
					break;
				default:
					message = error.message;
			}
		}

		return {
			...result,
			message:
				message ||
				(await translate('email_confirm_send.message.failed')),
			situation: situation,
		};
	}
}
