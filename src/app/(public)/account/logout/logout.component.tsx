'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { logoutAction } from '@/app/(public)/account/logout/logout.action';
import { LogoutDefaultState } from '@/app/(public)/account/logout/logout.definition';
import {
	ErrorComponent,
	LoadingComponent,
	SuccessComponent,
} from '@/components/status.component';
import Routes from '@/config/routes.setup';
import { useAuth } from '@/providers/auth.provider';

export default function Logout() {
	const [state, setState] = useState(LogoutDefaultState);
	const { setAuth, setAuthStatus } = useAuth();

	const hasExecuted = useRef(false);

	useEffect(() => {
		if (hasExecuted.current) {
			return;
		}

		hasExecuted.current = true;

		(async () => {
			const result = await logoutAction();

			setState(result);
		})();
	}, []);

	useEffect(() => {
		if (state.situation === 'success') {
			setAuth(null); // Clear auth state immediately after successful logout
			setAuthStatus('unauthenticated');
		}
	}, [setAuth, setAuthStatus, state.situation]);

	if (state.situation === null) {
		return (
			<LoadingComponent
				title="Logout"
				description="Your session will end. See you next time!"
			/>
		);
	}

	if (state.situation === 'error') {
		return (
			<ErrorComponent
				title="Logout"
				description={
					state.message ||
					'An error occurred while logging out. Please try again later. If the problem persists, contact support!'
				}
			/>
		);
	}

	if (state.situation === 'success') {
		return (
			<SuccessComponent
				title="Logout"
				description={
					state.message ||
					'Your session has been ended. See you next time!'
				}
			>
				<div className="text-center mt-6">
					What next? <br />
					You can go back to{' '}
					<Link
						href={Routes.get('login')}
						className="text-primary font-medium hover:underline"
					>
						login
					</Link>{' '}
					or navigate to{' '}
					<Link
						href={Routes.get('home')}
						className="text-primary font-medium hover:underline"
					>
						home page
					</Link>
				</div>
			</SuccessComponent>
		);
	}
}
