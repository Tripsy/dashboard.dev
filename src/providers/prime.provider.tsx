'use client';

import { PrimeReactProvider } from 'primereact/api';
import { type ReactNode, useEffect, useRef } from 'react';
import { useTheme } from '@/providers/theme.provider';

export const PrimeProvider = ({ children }: { children: ReactNode }) => {
	const { theme } = useTheme();
	const linksAdded = useRef(false);

	useEffect(() => {
		const themeLinkId = 'prime-theme';
		const coreLinkId = 'prime-core';
		const themeUrl = `https://unpkg.com/primereact/resources/themes/lara-${theme}-blue/theme.css`;
		const coreUrl =
			'https://unpkg.com/primereact/resources/primereact.min.css';

		if (!linksAdded.current) {
			// Theme stylesheet
			let themeLink = document.getElementById(
				themeLinkId,
			) as HTMLLinkElement;

			if (!themeLink) {
				themeLink = document.createElement('link');
				themeLink.id = themeLinkId;
				themeLink.rel = 'stylesheet';
				document.head.appendChild(themeLink);
			}

			themeLink.href = themeUrl;

			if (!document.getElementById(coreLinkId)) {
				const coreLink = document.createElement('link');
				coreLink.id = coreLinkId;
				coreLink.rel = 'stylesheet';
				coreLink.href = coreUrl;
				document.head.appendChild(coreLink);
			}

			linksAdded.current = true;
		} else {
			const themeLink = document.getElementById(
				themeLinkId,
			) as HTMLLinkElement;

			if (themeLink) {
				themeLink.href = themeUrl;
			}
		}
	}, [theme]);

	return <PrimeReactProvider>{children}</PrimeReactProvider>;
};
