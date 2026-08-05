import type { AuthTokenType } from '@/types/auth.type';

export type OAuthCallbackSituationType =
	| 'pending'
	| 'success'
	| 'error'
	| 'maxActiveSession';

export type OAuthCallbackStateType = {
	situation: OAuthCallbackSituationType;
	message: string | null;
	/** Where to send the user once the session exists; empty means "home". */
	redirectTo: string;
	/** Present only in the `maxActiveSession` case, so a session can be revoked. */
	authTokens?: AuthTokenType[];
};

export const OAuthCallbackState: OAuthCallbackStateType = {
	situation: 'pending',
	message: null,
	redirectTo: '',
};
