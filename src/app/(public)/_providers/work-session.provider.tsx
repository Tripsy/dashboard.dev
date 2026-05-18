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
import type { CmrSessionModel } from '@/models/cmr-session.model';
import type { CompanyVehicleModel } from '@/models/company-vehicle.model';
import type { WorkSessionModel } from '@/models/work-session.model';
import type { WorkSessionVehicleModel } from '@/models/work-session-vehicle.model';
import { useAuth } from '@/providers/auth.provider';
import {
	requestActiveWorkSession,
	requestAvailableCompanyVehicles,
} from '@/services/driver-session.service';
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
	availableCompanyVehicles: CompanyVehicleModel[];
	workSessionCmrs: CmrSessionModel[];
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
		isLoading: isSessionDataLoading,
		refetch: refetchSession,
	} = useQuery({
		queryKey: ['work-session', auth?.id],
		queryFn: () => {
			if (!auth?.id) {
				throw new Error('No auth');
			}

			return requestActiveWorkSession();
		},
		enabled: isDriver(auth),
		initialData: initSession,
		staleTime: REFRESH_INTERVAL,
	});

	const {
		data: availableCompanyVehicles,
		refetch: refetchAvailableCompanyVehicles,
	} = useQuery({
		queryKey: ['company-vehicle', 'available'],
		queryFn: () => {
			if (!auth?.id) {
				throw new Error('No auth');
			}

			return requestAvailableCompanyVehicles();
		},
		enabled: isDriver(auth),
		staleTime: REFRESH_INTERVAL,
	});

	const sessionSituation = getSessionSituation(
		auth,
		isSessionDataLoading,
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
				await refetchAvailableCompanyVehicles();
			} catch {
				// Error surfaces via query state
			} finally {
				sessionRefreshingRef.current = false;
			}
		},
		[refetchSession, refetchAvailableCompanyVehicles],
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
			availableCompanyVehicles: availableCompanyVehicles || [],
			workSessionCmrs: sessionData?.workSessionCmrs || [],
			refreshSession,
		}),
		[
			sessionSituation,
			sessionData,
			availableCompanyVehicles,
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
