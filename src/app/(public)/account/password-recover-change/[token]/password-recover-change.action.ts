import {
	type PasswordRecoverChangeFormFieldsType,
	PasswordRecoverChangeSchema,
	type PasswordRecoverChangeSituationType,
	type PasswordRecoverChangeStateType,
} from '@/app/(public)/account/password-recover-change/[token]/password-recover-change.definition';
import { Configuration } from '@/config/settings.config';
import { translate } from '@/config/translate.setup';
import { ApiError } from '@/exceptions/api.error';
import { accumulateZodErrors } from '@/helpers/form.helper';
import { isValidCsrfToken } from '@/helpers/session.helper';
import { passwordRecoverChangeAccount } from '@/services/account.service';

export function passwordRecoverChangeFormValues(
	formData: FormData,
): PasswordRecoverChangeFormFieldsType {
	return {
		password: formData.get('password') as string,
		password_confirm: formData.get('password_confirm') as string,
	};
}

export function passwordRecoverChangeValidate(
	values: PasswordRecoverChangeFormFieldsType,
) {
	return PasswordRecoverChangeSchema.safeParse(values);
}

export async function passwordRecoverChangeAction(
	state: PasswordRecoverChangeStateType,
	formData: FormData,
): Promise<PasswordRecoverChangeStateType> {
	const values = passwordRecoverChangeFormValues(formData);
	const validated = passwordRecoverChangeValidate(values);

	const result: PasswordRecoverChangeStateType = {
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
			errors: accumulateZodErrors<PasswordRecoverChangeFormFieldsType>(
				validated.error,
			),
		};
	}

	try {
		const fetchResponse = await passwordRecoverChangeAccount(
			result.token,
			validated.data,
		);

		return {
			...result,
			errors: {},
			message: fetchResponse?.message || null,
			situation: fetchResponse?.success ? 'success' : 'error',
		};
	} catch (error: unknown) {
		let message: string = '';
		const situation: PasswordRecoverChangeSituationType = 'error';

		if (error instanceof ApiError) {
			message = error.message;
		}

		return {
			...result,
			message:
				message ||
				(await translate('password_recover_change.message.failed')),
			situation: situation,
		};
	}
}
