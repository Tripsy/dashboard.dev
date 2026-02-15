'use client';

import {
	createContext,
	type ReactNode,
	useContext,
	useLayoutEffect,
	useState,
} from 'react';

type MenuState = 'open' | 'closed';

const SideMenuContext = createContext<
	| {
			menuState: MenuState;
			menuToggle: () => void;
			open: () => void;
			close: () => void;
	  }
	| undefined
>(undefined);

const SideMenuProvider = ({ children }: { children: ReactNode }) => {
	const [menuState, setMenuState] = useState<MenuState>('open');

	useLayoutEffect(() => {
		const saved = localStorage.getItem('side-menu-state') as MenuState;

		setMenuState(saved || 'open');
	}, []);

	const setAndPersist = (next: MenuState) => {
		setMenuState(next);
		localStorage.setItem('side-menu-state', next);
	};

	const menuToggle = () => {
		setAndPersist(menuState === 'open' ? 'closed' : 'open');
	};

	const open = () => setAndPersist('open');
	const close = () => setAndPersist('closed');

	return (
		<SideMenuContext.Provider
			value={{
				menuState,
				menuToggle,
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
