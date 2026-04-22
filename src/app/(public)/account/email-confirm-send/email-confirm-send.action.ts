import {
	type EmailConfirmSendFormValuesType,
	type EmailConfirmSendSituationType,
	type EmailConfirmSendStateType,
	getEmailConfirmSendFormValues,
	validateFormEmailConfirmSend,
} from '@/app/(public)/account/email-confirm-send/email-confirm-send.definition';
import { translate } from '@/config/translate.setup';
import { ApiError } from '@/exceptions/api.error';
import { accumulateZodErrors } from '@/helpers/form.helper';
import { isValidCsrfToken } from '@/helpers/session.helper';
import { requestEmailConfirmSend } from '@/services/account.service';

export async function emailConfirmSendAction(
	formState: EmailConfirmSendStateType,
	formData: FormData,
): Promise<EmailConfirmSendStateType> {
	if (!(await isValidCsrfToken(formData))) {
		return {
			...formState,
			message: await translate('app.error.csrf'),
			situation: 'csrf_error',
		};
	}

	const formValues = getEmailConfirmSendFormValues(formData);
	const validated = validateFormEmailConfirmSend(formValues);

	if (!validated.success) {
		const errors = accumulateZodErrors<EmailConfirmSendFormValuesType>(
			validated.error,
		);

		return {
			...formState,
			values: formValues,
			situation: 'error',
			message: await translate('app.error.validation'),
			errors,
		};
	}

	try {
		const requestResponse = await requestEmailConfirmSend(validated.data);

		return {
			...formState,
			values: validated.data,
			message: requestResponse?.message || null,
			situation: requestResponse?.success ? 'success' : 'error',
		};
	} catch (error: unknown) {
		let message: string = '';
		const situation: EmailConfirmSendSituationType = 'error';

		if (error instanceof ApiError) {
			switch (error.status) {
				case 403:
					message = await translate(
						'email-confirm-send.message.not_allowed',
					);
					break;
				case 404:
					message = await translate(
						'email-confirm-send.message.not_active',
					);
					break;
				default:
					message = error.message;
			}
		}

		return {
			...formState,
			values: validated.data,
			message:
				message ||
				(await translate('email-confirm-send.message.failed')),
			situation: situation,
		};
	}
}
