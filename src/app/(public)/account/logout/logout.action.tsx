import type {
	LogoutSituation,
	LogoutState,
} from '@/app/(public)/account/logout/logout.definition';
import { translate } from '@/config/translate.setup';
import { ApiError } from '@/exceptions/api.error';
import { logoutAccount } from '@/services/account.service';
import { clearAuth } from '@/services/auth.service';
import type { ApiResponseFetch } from '@/types/api.type';

export async function logoutAction(): Promise<LogoutState> {
	try {
		const fetchResponse: ApiResponseFetch<null> = await logoutAccount();

		if (fetchResponse?.success) {
			const authResponse = await clearAuth();

			if (authResponse?.success) {
				return {
					message: authResponse?.message,
					situation: 'success',
				};
			} else {
				return {
					message:
						authResponse?.message ||
						(await translate('logout.message.error')),
					situation: 'error',
				};
			}
		} else {
			return {
				message:
					fetchResponse?.message ||
					(await translate('logout.message.error')),
				situation: 'error',
			};
		}
	} catch (error: unknown) {
		let message: string = '';
		const situation: LogoutSituation = 'error';

		if (error instanceof ApiError) {
			switch (error.status) {
				case 401:
					message = await translate('logout.message.not_logged_in');
					break;
			}
		}

		return {
			message: message || (await translate('logout.message.error')),
			situation: situation,
		};
	}
}
