import Link from 'next/link';
import type { JSX } from 'react';
import { Breadcrumb } from '@/app/(dashboard)/_components/breadcrumb.component';
import DashboardMain from '@/app/(dashboard)/_components/dashboard-main.component';
import { SideMenu } from '@/app/(dashboard)/_components/side-menu.component';
import { DashboardProvider } from '@/app/(dashboard)/_providers/dashboard.provider';
import { LogoComponent } from '@/components/layout/logo.default';
import { UserMenu } from '@/components/layout/user-menu.component';
import ProtectedRoute from '@/components/protected-route.component';
import { ToggleTheme } from '@/components/toggle-theme';
import Routes, { RouteAuth } from '@/config/routes.setup';
import { Configuration } from '@/config/settings.config';
import {SideMenuToggle} from "@/app/(dashboard)/_components/side-menu-toggle.component";

function Header() {
	return (
		<header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="container-dashboard mx-4">
				<div className="flex items-center h-16 gap-2">
					<SideMenuToggle />
					<Link
						href={Routes.get('home')}
						className="flex items-center gap-2"
					>
						<LogoComponent divClass="h-9 w-9" spanClass="text-lg" />
						<span className="text-xl font-semibold text-foreground">
							{Configuration.get('app.name')}
						</span>
					</Link>

					<div className="w-full pl-26">
						<Breadcrumb />
					</div>

					<div className="flex items-center gap-2">
						<ToggleTheme />
						<UserMenu />
					</div>
				</div>
			</div>
		</header>
	);
}

export default async function Layout({ children }: { children: JSX.Element }) {
	return (
		<DashboardProvider>
			<div className="dashboard-layout min-h-screen bg-background">
				<Header />
				<ProtectedRoute routeAuth={RouteAuth.PROTECTED}>
					<DashboardMain>
						<SideMenu />
						<div className="container-dashboard">
							<Breadcrumb />
							{children}
						</div>
					</DashboardMain>
				</ProtectedRoute>
			</div>
		</DashboardProvider>
	);
}
