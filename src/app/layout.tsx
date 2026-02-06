import './globals.css';
import type { ReactNode } from 'react';
import { Providers } from '@/app/providers';
import { getLanguage } from '@/config/translate.setup';

export default async function RootLayout({
	children,
}: Readonly<{
	children: ReactNode;
}>) {
	const language = await getLanguage();

	return (
		<Providers>
			<html lang={language}>
				<body>{children}</body>
			</html>
		</Providers>
	);
}
