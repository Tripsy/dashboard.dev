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
import { requestFind } from '@/helpers/services.helper';
import { isDriver } from '@/models/auth.model';
import {
	type WorkSessionModel,
	WorkSessionStatusEnum,
} from '@/models/work-session.model';
import type { WorkSessionVehicleModel } from '@/models/work-session-vehicle.model';
import { useAuth } from '@/providers/auth.provider';

type SessionStatus =
	| 'loading'
	| 'active'
	| 'missing'
	| 'not-applicable'
	| 'error';

type WorkSessionContextType = {
	recentSessions: WorkSessionModel[];
	activeSession: WorkSessionModel | null;
	sessionStatus: SessionStatus;
	refreshSession: () => Promise<void>;
};

const REFRESH_INTERVAL = 10 * 60 * 1000; // 10 minutes

const WorkSessionContext = createContext<WorkSessionContextType | undefined>(
	undefined,
);

function getActiveSession(
	sessions: WorkSessionModel[],
): WorkSessionModel | null {
	return (
		sessions.find(
			(session) => session.status === WorkSessionStatusEnum.ACTIVE,
		) || null
	);
}

function getRecentSessions(sessions: WorkSessionModel[]): WorkSessionModel[] {
	return sessions.filter(
		(session) => session.status !== WorkSessionStatusEnum.ACTIVE,
	);
}

function getSessionStatus(
	auth: ReturnType<typeof useAuth>['auth'],
	isLoading: boolean,
	activeSession: WorkSessionModel | null,
): SessionStatus {
	if (!isDriver(auth)) {
		return 'not-applicable';
	}

	if (isLoading) {
		return 'loading';
	}

	return activeSession ? 'active' : 'missing';
}

const WorkSessionProvider = ({
	children,
	initSessions = [],
}: {
	children: ReactNode;
	initSessions?: WorkSessionModel[];
}) => {
	const { auth } = useAuth();

	const {
		data: sessionsData,
		isLoading: isSessionsLoading,
		refetch: refetchSessions,
	} = useQuery({
		queryKey: ['work-session', auth?.id],
		queryFn: () => {
			if (!auth?.id) {
				throw new Error('No auth');
			}

			return requestFind<WorkSessionModel>('work-session', {
				filter: { user_id: auth.id },
				limit: 10,
				order_by: 'id',
				direction: 'DESC',
			});
		},
		enabled: isDriver(auth),
		initialData:
			initSessions.length > 0 ? { entries: initSessions } : undefined,
		staleTime: REFRESH_INTERVAL,
	});

	const sessions = sessionsData?.entries ?? [];
	const activeSession = getActiveSession(sessions);
	const recentSessions = getRecentSessions(sessions);

	const { data: vehiclesData, refetch: refetchVehicles } = useQuery({
		queryKey: ['work-session-vehicle', activeSession?.id],
		queryFn: () => {
			if (!activeSession?.id) {
				throw new Error('No active session');
			}

			return requestFind<WorkSessionVehicleModel>(
				'work-session-vehicle',
				{
					filter: { work_session_id: activeSession.id },
				},
			);
		},
		enabled: !!activeSession?.id,
		staleTime: REFRESH_INTERVAL,
	});

	const activeSessionWithVehicles = useMemo(() => {
		if (!activeSession) return null;
		return {
			...activeSession,
			work_session_vehicle: vehiclesData?.entries ?? [],
		};
	}, [activeSession, vehiclesData]);

	const sessionStatus = getSessionStatus(
		auth,
		isSessionsLoading,
		activeSession,
	);

	const sessionRefreshingRef = useRef(false);

	const refreshSession = useCallback(
		async ({ silent: _silent = false } = {}) => {
			if (sessionRefreshingRef.current) return;

			try {
				sessionRefreshingRef.current = true;

				const { data } = await refetchSessions();
				const active = getActiveSession(data?.entries ?? []);

				if (active?.id) {
					await refetchVehicles();
				}
			} catch {
				// sessionStatus is derived, error surfaces via query state
			} finally {
				sessionRefreshingRef.current = false;
			}
		},
		[refetchSessions, refetchVehicles],
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
			recentSessions,
			activeSession: activeSessionWithVehicles,
			sessionStatus,
			refreshSession,
		}),
		[
			recentSessions,
			activeSessionWithVehicles,
			sessionStatus,
			refreshSession,
		],
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
