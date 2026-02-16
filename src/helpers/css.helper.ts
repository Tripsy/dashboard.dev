import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function isLargeScreen(): boolean {
	if (typeof window === 'undefined') {
		return true;
	} // SSR safety

	try {
		return window.matchMedia('(min-width: 1024px)').matches;
	} catch (error) {
		console.error('Error checking screen size:', error);

		return false;
	}
}
