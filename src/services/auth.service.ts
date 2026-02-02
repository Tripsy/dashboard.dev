'use server';

import { translate } from '@/config/lang';
import { Configuration } from '@/config/settings.config';
import { type AuthModel, prepareAuthModel } from '@/entities/auth.model';
import { ApiError } from '@/exceptions/api.error';
import { ApiRequest, getResponseData } from '@/helpers/api.helper';
import {
	deleteCookie,
	getTrackedCookie,
	setupTrackedCookie,
} from '@/helpers/session.helper';
import { apiHeaders } from '@/helpers/system.helper';
import type { ApiResponseFetch } from '@/types/api.type';

export async function createAuth(
	sessionToken: string,
): Promise<ApiResponseFetch<null>> {
	if (!sessionToken) {
		return {
			message: 'No token provided',
			success: false,
		};
	}

	await setupTrackedCookie(
		{
			action: 'set',
			name: Configuration.get('user.sessionToken') as string,
			value: sessionToken,
		},
		{
			httpOnly: true,
			maxAge: Configuration.get('user.sessionMaxAge') as number,
		},
	);

	return {
		message: await translate('login.message.auth_success'),
		success: true,
	};
}

export async function getAuth(): Promise<ApiResponseFetch<AuthModel>> {
	try {
		const sessionToken = await getTrackedCookie(
			Configuration.get('user.sessionToken') as string,
		);

		if (!sessionToken.value) {
			return {
				data: null,
				message: 'Could not retrieve auth model (eg: no session token)',
				success: false,
			};
		}

		const fetchResponse: ApiResponseFetch<AuthModel> | undefined =
			await new ApiRequest()
				.setRequestMode('remote-api')
				.doFetch('/account/me', {
					method: 'GET',
					headers: {
						Authorization: `Bearer ${sessionToken.value}`,
						...(await apiHeaders()),
					},
				});

		if (fetchResponse?.success) {
			const responseData = getResponseData(fetchResponse);

			if (responseData) {
				const authModel = prepareAuthModel(responseData);

				await setupTrackedCookie(sessionToken, {
					httpOnly: true,
					maxAge: Configuration.get('user.sessionMaxAge') as number,
				});

				return {
					data: authModel,
					message: 'Ok',
					success: true,
				};
			}
		}

		await deleteCookie(Configuration.get('user.sessionToken') as string);

		return {
			data: null,
			message:
				fetchResponse?.message ||
				'Could not retrieve auth model (eg: unknown error)',
			success: false,
		};
	} catch (error: unknown) {
		if (error instanceof ApiError && error.status === 401) {
			await deleteCookie(
				Configuration.get('user.sessionToken') as string,
			);
		}

		return {
			data: null,
			message:
				error instanceof Error
					? error.message
					: 'Could not retrieve auth model (eg: unknown error)',
			success: false,
		};
	}
}

export async function clearAuth(): Promise<ApiResponseFetch<null>> {
	await deleteCookie(Configuration.get('user.sessionToken') as string);

	return {
		message: await translate('logout.message.success'),
		success: true,
	};
}
