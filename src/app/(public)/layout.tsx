import type { ReactNode } from 'react';
import { DataSourceRegistrar } from '@/app/(dashboard)/_components/data-source-registrar.component';
import { Footer } from '@/components/layout/footer.default';
import { Header } from '@/components/layout/header.default';
import { WindowContainer } from '@/components/window/window-container.component';

export default async function Layout({
	children,
}: Readonly<{
	children: ReactNode;
}>) {
	return (
		<div className="min-h-screen flex flex-col bg-background">
			<DataSourceRegistrar />
			<Header />
			<main className="flex-1">{children}</main>
			<WindowContainer section="public" />
			<Footer />
		</div>
	);
}
