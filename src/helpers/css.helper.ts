import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function isLargeScreen(): boolean {
	try {
		return window.matchMedia('(min-width: 1024px)').matches;
	} catch (error) {
		console.error('Error checking screen size:', error);

		return false;
	}
}

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}
