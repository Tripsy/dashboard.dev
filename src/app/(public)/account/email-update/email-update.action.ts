import {
	type EmailUpdateFormFieldsType,
	EmailUpdateSchema,
	type EmailUpdateSituationType,
	type EmailUpdateStateType,
} from '@/app/(public)/account/email-update/email-update.definition';
import { Configuration } from '@/config/settings.config';
import { translate } from '@/config/translate.setup';
import { ApiError } from '@/exceptions/api.error';
import { accumulateZodErrors } from '@/helpers/form.helper';
import { isValidCsrfToken } from '@/helpers/session.helper';
import { emailUpdateAccount } from '@/services/account.service';

export function emailUpdateFormValues(
	formData: FormData,
): EmailUpdateFormFieldsType {
	return {
		email_new: formData.get('email_new') as string,
	};
}

export function emailUpdateValidate(values: EmailUpdateFormFieldsType) {
	return EmailUpdateSchema.safeParse(values);
}

export async function emailUpdateAction(
	state: EmailUpdateStateType,
	formData: FormData,
): Promise<EmailUpdateStateType> {
	const values = emailUpdateFormValues(formData);
	const validated = emailUpdateValidate(values);

	const result: EmailUpdateStateType = {
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
			errors: accumulateZodErrors<EmailUpdateFormFieldsType>(
				validated.error,
			),
		};
	}

	try {
		const fetchResponse = await emailUpdateAccount(validated.data);

		return {
			...result,
			errors: {},
			message: fetchResponse?.message || null,
			situation: fetchResponse?.success ? 'success' : 'error',
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
			...result,
			errors: {},
			message: message || (await translate('app.error.form')),
			situation: situation,
		};
	}
}
