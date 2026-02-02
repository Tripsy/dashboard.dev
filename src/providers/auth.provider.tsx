'use client';

import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from 'react';
import type { AuthModel } from '@/entities/auth.model';
import { ApiError } from '@/exceptions/api.error';
import { getAuth } from '@/services/auth.service';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated' | 'error';

type AuthContextType = {
	auth: AuthModel;
	setAuth: (model: AuthModel) => void;
	authStatus: AuthStatus;
	setAuthStatus: (status: AuthStatus) => void;
	refreshAuth: () => Promise<void>;
};

const REFRESH_INTERVAL = 10 * 60 * 1000; // 10 minutes

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AuthProvider = ({
	children,
	initAuth = null,
}: {
	children: ReactNode;
	initAuth?: AuthModel;
}) => {
	const [auth, setAuth] = useState<AuthModel>(initAuth);
	const [authStatus, setAuthStatus] = useState<AuthStatus>('loading');

	const refreshAuth = useCallback(async () => {
		try {
			setAuthStatus('loading');

			const authResponse = await getAuth();

			const authData =
				authResponse?.success && authResponse?.data
					? authResponse?.data
					: null;

			setAuth(authData);

			if (authData) {
				setAuthStatus('authenticated');
			} else {
				setAuthStatus('unauthenticated');
			}
		} catch (error: unknown) {
			if (error instanceof ApiError && error.status === 401) {
				setAuthStatus('unauthenticated');
			} else {
				setAuthStatus('error');
			}
		}
	}, []);

	// Initial auth setup
	useEffect(() => {
		if (initAuth) {
			setAuth(initAuth);
			setAuthStatus('authenticated');
		} else {
			(async () => {
				await refreshAuth();
			})();
		}
	}, [initAuth, refreshAuth]);

	useEffect(() => {
		const refreshIfVisible = () => {
			if (document.visibilityState === 'visible') {
				(async () => {
					await refreshAuth();
				})();
			}
		};

		const intervalId = setInterval(refreshIfVisible, REFRESH_INTERVAL);
		document.addEventListener('visibilitychange', refreshIfVisible);

		return () => {
			clearInterval(intervalId);
			document.removeEventListener('visibilitychange', refreshIfVisible);
		};
	}, [refreshAuth]);

	const contextValue = useMemo(
		() => ({
			auth,
			setAuth,
			authStatus,
			setAuthStatus,
			refreshAuth,
		}),
		[auth, authStatus, refreshAuth],
	);

	return (
		<AuthContext.Provider value={contextValue}>
			{children}
		</AuthContext.Provider>
	);
};

function useAuth() {
	const context = useContext(AuthContext);

	if (context === undefined) {
		throw new Error('useAuth must be used within a AuthProvider');
	}

	return context;
}

export { AuthContext, AuthProvider, useAuth };
