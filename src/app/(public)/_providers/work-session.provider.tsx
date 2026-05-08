'use client';

import { useQuery } from '@tanstack/react-query';
import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
} from 'react';
import { isDriver } from '@/models/auth.model';
import type { WorkSessionModel } from '@/models/work-session.model';
import type { WorkSessionVehicleModel } from '@/models/work-session-vehicle.model';
import { useAuth } from '@/providers/auth.provider';
import { requestWorkSession } from '@/services/account.service';
import type { WorkSessionType } from '@/types/auth.type';

type SessionSituation =
	| 'loading'
	| 'active'
	| 'missing'
	| 'not-applicable'
	| 'error';

type WorkSessionContextType = {
	sessionSituation: SessionSituation;
	activeSession: WorkSessionModel | null;
	activeSessionVehicles: WorkSessionVehicleModel[];
	refreshSession: () => Promise<void>;
};

const REFRESH_INTERVAL = 10 * 60 * 1000; // 10 minutes

const WorkSessionContext = createContext<WorkSessionContextType | undefined>(
	undefined,
);

function getSessionSituation(
	auth: ReturnType<typeof useAuth>['auth'],
	isLoading: boolean,
	workSession: WorkSessionModel | null,
): SessionSituation {
	if (!isDriver(auth)) {
		return 'not-applicable';
	}

	if (isLoading) {
		return 'loading';
	}

	return workSession ? 'active' : 'missing';
}

const WorkSessionProvider = ({
	children,
	initSession,
}: {
	children: ReactNode;
	initSession?: WorkSessionType;
}) => {
	const { auth } = useAuth();

	const {
		data: sessionData,
		isLoading: isSessionLoading,
		refetch: refetchSession,
	} = useQuery({
		queryKey: ['work-session', auth?.id],
		queryFn: () => {
			if (!auth?.id) {
				throw new Error('No auth');
			}

			return requestWorkSession();
		},
		enabled: isDriver(auth),
		initialData: initSession,
		staleTime: REFRESH_INTERVAL,
	});

	const sessionSituation = getSessionSituation(
		auth,
		isSessionLoading,
		sessionData?.workSession || null,
	);

	const sessionRefreshingRef = useRef(false);

	const refreshSession = useCallback(
		async ({ silent: _silent = false } = {}) => {
			if (sessionRefreshingRef.current) {
				return;
			}

			try {
				sessionRefreshingRef.current = true;

				await refetchSession();
			} catch {
				// Error surfaces via query state
			} finally {
				sessionRefreshingRef.current = false;
			}
		},
		[refetchSession],
	);

	useEffect(() => {
		// Interval-based refresh — runs regardless of visibility
		const intervalId = setInterval(() => {
			refreshSession({ silent: true }).catch(console.error);
		}, REFRESH_INTERVAL);

		// Tab visibility refresh — only refresh if tab was hidden long enough
		let hiddenAt: number | null = null;
		const HIDDEN_THRESHOLD = 5 * 60 * 1000; // only refresh if hidden for 5+ minutes

		const refreshIfVisible = () => {
			if (document.visibilityState === 'hidden') {
				hiddenAt = Date.now();
				return;
			}

			if (hiddenAt && Date.now() - hiddenAt > HIDDEN_THRESHOLD) {
				refreshSession({ silent: true }).catch(console.error);
			}

			hiddenAt = null;
		};

		document.addEventListener('visibilitychange', refreshIfVisible);

		return () => {
			clearInterval(intervalId);
			document.removeEventListener('visibilitychange', refreshIfVisible);
		};
	}, [refreshSession]);

	const contextValue = useMemo(
		() => ({
			sessionSituation,
			activeSession: sessionData?.workSession || null,
			activeSessionVehicles: sessionData?.workSessionVehicles || [],
			refreshSession,
		}),
		[sessionSituation, sessionData, refreshSession],
	);

	return (
		<WorkSessionContext.Provider value={contextValue}>
			{children}
		</WorkSessionContext.Provider>
	);
};

function useWorkSession() {
	const context = useContext(WorkSessionContext);

	if (context === undefined) {
		throw new Error(
			'useWorkSession must be used within a WorkSessionProvider',
		);
	}

	return context;
}

export { WorkSessionContext, WorkSessionProvider, useWorkSession };
