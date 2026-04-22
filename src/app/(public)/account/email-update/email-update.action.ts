import {
	type EmailUpdateFormValuesType,
	type EmailUpdateSituationType,
	type EmailUpdateStateType,
	getEmailUpdateFormValues,
	validateFormEmailUpdate,
} from '@/app/(public)/account/email-update/email-update.definition';
import { translate } from '@/config/translate.setup';
import { ApiError } from '@/exceptions/api.error';
import { accumulateZodErrors } from '@/helpers/form.helper';
import { isValidCsrfToken } from '@/helpers/session.helper';
import { requestEmailUpdate } from '@/services/account.service';

export async function emailUpdateAction(
	formState: EmailUpdateStateType,
	formData: FormData,
): Promise<EmailUpdateStateType> {
	if (!(await isValidCsrfToken(formData))) {
		return {
			...formState,
			message: await translate('app.error.csrf'),
			situation: 'csrf_error',
		};
	}

	const formValues = getEmailUpdateFormValues(formData);
	const validated = validateFormEmailUpdate(formValues);

	if (!validated.success) {
		const errors = accumulateZodErrors<EmailUpdateFormValuesType>(
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
		const requestResponse = await requestEmailUpdate(validated.data);

		return {
			...formState,
			values: validated.data,
			message: requestResponse?.message || null,
			situation: requestResponse?.success ? 'success' : 'error',
		};
	} catch (error: unknown) {
		let message: string = '';
		const situation: EmailUpdateSituationType = 'error';

		if (error instanceof ApiError) {
			switch (error.status) {
				case 409:
					message = await translate(
						'account-email-update.validation.email_already_used',
					);
					break;
			}
		}

		return {
			...formState,
			values: validated.data,
			message: message || (await translate('app.error.form')),
			situation: situation,
		};
	}
}
