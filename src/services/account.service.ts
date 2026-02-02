import type { AccountDeleteFormFieldsType } from '@/app/(public)/account/delete/account-delete.definition';
import type { AccountEditFormFieldsType } from '@/app/(public)/account/edit/account-edit.definition';
import type { EmailConfirmSendFormFieldsType } from '@/app/(public)/account/email-confirm-send/email-confirm-send.definition';
import type { EmailUpdateFormFieldsType } from '@/app/(public)/account/email-update/email-update.definition';
import type { LoginFormFieldsType } from '@/app/(public)/account/login/login.definition';
import type { PasswordRecoverFormFieldsType } from '@/app/(public)/account/password-recover/password-recover.definition';
import type { PasswordRecoverChangeFormFieldsType } from '@/app/(public)/account/password-recover-change/[token]/password-recover-change.definition';
import type { PasswordUpdateFormFieldsType } from '@/app/(public)/account/password-update/password-update.definition';
import type { RegisterFormFieldsType } from '@/app/(public)/account/register/register.definition';
import type { UserModel } from '@/entities/user.model';
import { ApiRequest, type ResponseFetch } from '@/helpers/api.helper';

export async function registerAccount(
	params: RegisterFormFieldsType,
): Promise<ResponseFetch<UserModel>> {
	return await new ApiRequest().doFetch('/account/register', {
		method: 'POST',
		body: JSON.stringify(params),
	});
}

export async function loginAccount(
	params: LoginFormFieldsType,
): Promise<
	ResponseFetch<{ token: string } | { authValidTokens: AuthTokenListType }>
> {
	return await new ApiRequest().doFetch('/account/login', {
		method: 'POST',
		body: JSON.stringify(params),
	});
}

export async function removeTokenAccount(
	token: string,
): Promise<ResponseFetch<null>> {
	return await new ApiRequest().doFetch('/account/token', {
		method: 'DELETE',
		body: JSON.stringify({
			ident: token,
		}),
	});
}

export async function logoutAccount(): Promise<ResponseFetch<null>> {
	return await new ApiRequest().doFetch('/account/logout', {
		method: 'DELETE',
	});
}

export async function passwordRecoverAccount(
	params: PasswordRecoverFormFieldsType,
): Promise<ResponseFetch<null>> {
	return await new ApiRequest().doFetch('/account/password-recover', {
		method: 'POST',
		body: JSON.stringify(params),
	});
}

export async function passwordRecoverChangeAccount(
	token: string,
	params: PasswordRecoverChangeFormFieldsType,
): Promise<ResponseFetch<null>> {
	return await new ApiRequest().doFetch(
		`/account/password-recover-change/${token}`,
		{
			method: 'POST',
			body: JSON.stringify(params),
		},
	);
}

export async function emailConfirmSendAccount(
	params: EmailConfirmSendFormFieldsType,
): Promise<ResponseFetch<null>> {
	return await new ApiRequest().doFetch('/account/email-confirm-send', {
		method: 'POST',
		body: JSON.stringify(params),
	});
}

export type AuthTokenType = {
	ident: string;
	label: string;
	used_at: Date;
	used_now: boolean; // true - if is a match for the current session
};

export type AuthTokenListType = AuthTokenType[];

export async function getSessions(): Promise<AuthTokenListType | []> {
	try {
		const fetchResponse: ResponseFetch<AuthTokenListType> =
			await new ApiRequest().doFetch('/account/me/sessions', {
				method: 'GET',
			});

		if (fetchResponse?.success) {
			return fetchResponse.data || [];
		}
	} catch (error: unknown) {
		console.error(error);
	}

	return [];
}

export async function editAccount(
	params: AccountEditFormFieldsType,
): Promise<ResponseFetch<null>> {
	return await new ApiRequest().doFetch('/account/me/edit', {
		method: 'POST',
		body: JSON.stringify(params),
	});
}

export async function passwordUpdateAccount(
	params: PasswordUpdateFormFieldsType,
): Promise<ResponseFetch<{ token: string }>> {
	return await new ApiRequest().doFetch('/account/password-update', {
		method: 'POST',
		body: JSON.stringify(params),
	});
}

export async function emailUpdateAccount(
	params: EmailUpdateFormFieldsType,
): Promise<ResponseFetch<null>> {
	return await new ApiRequest().doFetch('/account/email-update', {
		method: 'POST',
		body: JSON.stringify(params),
	});
}

export async function deleteAccount(
	params: AccountDeleteFormFieldsType,
): Promise<ResponseFetch<{ token: string }>> {
	return await new ApiRequest().doFetch('/account/me/delete', {
		method: 'DELETE',
		body: JSON.stringify(params),
	});
}
