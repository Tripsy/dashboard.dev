import Link from 'next/link';
import type { ReactNode } from 'react';
import { UserMenu } from '@/app/(dashboard)/_components/user-menu.component';
import { Footer } from '@/components/layout-default.component';
import { ToggleTheme } from '@/components/toggle-theme';
import RoutesSetup from '@/config/routes.setup';

function Header() {
	return (
		<header className="fixed z-90 w-full">
			<div className="header-section justify-between">
				<div className="h-full flex items-center ">
					<Link
						href={RoutesSetup.get('home')}
						className="flex items-end hover:link-info"
					>
						<span className="text-lg font-bold">
							nextjs
							<sup className="text-xs">TEST</sup>
						</span>
					</Link>
				</div>
				<div className="flex items-center">
					<ToggleTheme />
					<UserMenu />
				</div>
			</div>
		</header>
	);
}

export default async function Layout({
	children,
}: Readonly<{
	children: ReactNode;
}>) {
	return (
		<div className="default-layout">
			<Header />
			<main className="main-section">
				<div className="content-section">{children}</div>
			</main>
			<Footer />
		</div>
	);
}
