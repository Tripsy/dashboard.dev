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
			toggleStatus: (status: Status) => void;
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

	const toggleStatus = (status: Status): void => {
		setStatus(status);

		localStorage.setItem('_providers-side-menu', status);
	};

	return (
		<SideMenuContext.Provider value={{ status, toggleStatus }}>
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
