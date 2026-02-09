import type { ReactNode } from 'react';
import { Footer } from '@/components/layout/footer.default';
import { Header } from '@/components/layout/header.default';

export default async function Layout({
	children,
}: Readonly<{
	children: ReactNode;
}>) {
	return (
		<div className="min-h-screen flex flex-col bg-background">
			<Header />
			<main className="flex-1">{children}</main>
			<Footer />
		</div>
	);
}
