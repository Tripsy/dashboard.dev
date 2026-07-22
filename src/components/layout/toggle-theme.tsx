'use client';

import { Moon, Sun } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { useTheme } from '@/providers/theme.provider';

export function ToggleTheme() {
	const { theme, toggleTheme } = useTheme();
	const isDark = theme === 'dark';

	return (
		<Switch
			size="lg"
			isSelected={isDark}
			onChange={toggleTheme}
			aria-label="Toggle theme"
			thumbIcon={
				isDark ? (
					<Moon className="h-3.5 w-3.5" />
				) : (
					<Sun className="h-3.5 w-3.5" />
				)
			}
		/>
	);
}
