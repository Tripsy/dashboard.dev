'use client';

import { PrimeReactProvider } from 'primereact/api';
import type { ReactNode } from 'react';
import { primePtPreset } from '@/config/prime-pt.preset';

/**
 * PrimeReact runs in `unstyled` mode: it ships no CSS of its own, and every element is
 * styled by the HeroUI-token pass-through preset (`primePtPreset`). Dark/light is handled
 * by the same `.dark` class the rest of the app uses, so no theme stylesheet is loaded.
 */
export const PrimeProvider = ({ children }: { children: ReactNode }) => {
	return (
		<PrimeReactProvider value={{ unstyled: true, pt: primePtPreset }}>
			{children}
		</PrimeReactProvider>
	);
};
