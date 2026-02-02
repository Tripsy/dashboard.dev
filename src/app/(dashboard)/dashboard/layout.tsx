import Link from 'next/link';
import type { JSX } from 'react';
import { NavBreadcrumb } from '@/app/(dashboard)/_components/nav-breadcrumb.component';
import { SideMenu } from '@/app/(dashboard)/_components/side-menu.component';
import SideMenuSetter from '@/app/(dashboard)/_components/side-menu.setter';
import { SideMenuToggle } from '@/app/(dashboard)/_components/side-menu-toggle.component';
import { UserMenu } from '@/app/(dashboard)/_components/user-menu.component';
import { DashboardProvider } from '@/app/(dashboard)/_providers/dashboard.provider';
import { Footer } from '@/components/layout-default.component';
import ProtectedRoute from '@/components/protected-route.component';
import { ToggleTheme } from '@/components/toggle-theme';
import RoutesSetup, { RouteAuth } from '@/config/routes.setup';

function Header() {
	return (
		<header className="fixed z-90 w-full">
			<div className="header-section">
				<div className="h-full flex items-center">
					<SideMenuToggle />
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
				<div className="w-full pl-16">
					<NavBreadcrumb />
				</div>
				<div className="flex items-center">
					<ToggleTheme />
					<UserMenu />
				</div>
			</div>
		</header>
	);
}

export default async function Layout({ children }: { children: JSX.Element }) {
	return (
		<DashboardProvider>
			<div className="dashboard-layout">
				<Header />
				<SideMenuSetter />
				<main className="main-section">
					<SideMenu />
					<div className="content-section">
						<NavBreadcrumb />
						<ProtectedRoute routeAuth={RouteAuth.PROTECTED}>
							{children}
						</ProtectedRoute>
					</div>
				</main>
				<Footer />
			</div>
		</DashboardProvider>
	);
}
