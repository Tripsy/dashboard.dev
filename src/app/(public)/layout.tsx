import type { ReactNode } from 'react';
import { Footer } from '@/components/layout/footer.default';
import { Header } from '@/components/layout/header.default';
import { WindowContainer } from '@/components/window/window-container.component';
import { Configuration } from '@/config/settings.config';
import { getLanguage } from '@/config/translate.setup';

export default async function Layout({
	children,
}: Readonly<{
	children: ReactNode;
}>) {
	const currentLanguage = await getLanguage();
	const supportedLanguages = Configuration.get('language.supported');

	return (
		<div className="min-h-screen flex flex-col bg-background">
			<Header
				currentLanguage={currentLanguage}
				supportedLanguages={supportedLanguages}
			/>
			<main className="flex-1">{children}</main>
			<WindowContainer section="public" />
			<Footer />
		</div>
	);
}
