import './globals.css';
import type { ReactNode } from 'react';
import { Providers } from '@/app/providers';
import { NavigationProgress } from '@/components/layout/navigation-progress.component';
import { getLanguage } from '@/config/translate.setup';

export default async function RootLayout({
	children,
}: Readonly<{
	children: ReactNode;
}>) {
	const currentLanguage = await getLanguage();

	return (
		<Providers>
			<html lang={currentLanguage} data-scroll-behavior="smooth">
				<body>
					<NavigationProgress />
					{children}
				</body>
			</html>
		</Providers>
	);
}
