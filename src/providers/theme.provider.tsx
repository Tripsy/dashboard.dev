'use client';

import {
	createContext,
	type ReactNode,
	useContext,
	useEffect,
	useState,
} from 'react';

type Theme = 'light' | 'dark';

const ThemeContext = createContext<
	| {
			theme: Theme;
			toggleTheme: (theme: Theme) => void;
	  }
	| undefined
>(undefined);

const ThemeProvider = ({ children }: { children: ReactNode }) => {
	const [theme, setTheme] = useState<Theme>('light');

	useEffect(() => {
		const saved = localStorage.getItem('theme') as Theme;
		const initial = saved || 'light';

		setTheme(initial);

		document.documentElement.setAttribute('data-theme', initial);
	}, []);

	// Update DOM and storage whenever theme changes
	useEffect(() => {
		document.documentElement.setAttribute('data-theme', theme);
		localStorage.setItem('theme', theme);
	}, [theme]);

	const toggleTheme = (value: Theme) => {
		setTheme(value);
	};

	return (
		<ThemeContext.Provider value={{ theme, toggleTheme }}>
			{children}
		</ThemeContext.Provider>
	);
};

function useTheme() {
	const context = useContext(ThemeContext);

	if (!context) {
		throw new Error('useTheme must be used within a ThemeProvider');
	}

	return context;
}

export { ThemeProvider, useTheme };
