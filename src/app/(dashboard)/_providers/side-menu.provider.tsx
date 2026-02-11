'use client';

import {
	createContext,
	type ReactNode,
	useContext,
	useLayoutEffect,
	useState,
} from 'react';
import { isLargeScreen } from '@/helpers/window.helper';

type Status = 'open' | 'closed';

const SideMenuContext = createContext<
	| {
			status: Status;
			toggle: () => void;
			open: () => void;
			close: () => void;
	  }
	| undefined
>(undefined);

const SideMenuProvider = ({ children }: { children: ReactNode }) => {
	const [status, setStatus] = useState<Status>('open');

	useLayoutEffect(() => {
		let status: Status;

		if (isLargeScreen()) {
			const saved = localStorage.getItem(
				'_providers-side-menu',
			) as Status;

			status = saved || 'open';
		} else {
			status = 'closed';
		}

		setStatus(status);
	}, []);

	// On route change, close menu on small screens
	useLayoutEffect(() => {
		if (!isLargeScreen()) {
			setStatus('closed');
		}
	}, []);

	const setAndPersist = (next: Status) => {
		setStatus(next);
		localStorage.setItem('_providers-side-menu', next);
	};

	const toggle = () => {
		setAndPersist(status === 'open' ? 'closed' : 'open');
	};

	const open = () => setAndPersist('open');
	const close = () => setAndPersist('closed');

	return (
		<SideMenuContext.Provider
			value={{
				status,
				toggle,
				open,
				close,
			}}
		>
			{children}
		</SideMenuContext.Provider>
	);
};

function useSideMenu() {
	const context = useContext(SideMenuContext);

	if (context === undefined) {
		throw new Error('useSideMenu must be used within a SideMenuProvider');
	}

	return context;
}

export { SideMenuContext, SideMenuProvider, useSideMenu };
