'use client';

import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { LogoComponent } from '@/components/layout/logo.default';
import { UserMenu } from '@/components/layout/user-menu.component';
import { ToggleTheme } from '@/components/toggle-theme';
import { Button } from '@/components/ui/button';
import Routes from '@/config/routes.setup';
import { Configuration } from '@/config/settings.config';
import { cn } from '@/helpers/css.helper';
import { useAuth } from '@/providers/auth.provider';

const navLinks = [
	{ href: '/', label: 'Home', hash: 'home' },
	{ href: '/features', label: 'Features' },
	{ href: Routes.get('docs'), label: 'Docs' },
	{ href: Routes.get('dashboard'), label: 'Dashboard' },
];

export function Header() {
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

	const { authStatus } = useAuth();

	const pathname = usePathname();
	const homePath = Routes.get('home');
	const [activeHash, setActiveHash] = useState('');
	const observerRef = useRef<IntersectionObserver | null>(null);

	useEffect(() => {
		if (pathname !== homePath) {
			if (activeHash) {
				setActiveHash('');
			}

			return;
		}

		// Disconnect existing observer
		if (observerRef.current) {
			observerRef.current.disconnect();
		}

		observerRef.current = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						setActiveHash(entry.target.id);
					}
				});
			},
			{ rootMargin: '-20% 0% -70% 0%' },
		);

		// Observe all target elements
		const observer = observerRef.current;

		navLinks.forEach((d) => {
			const element = document.querySelector(`#${d.hash}`);

			if (element) {
				observer.observe(element);
			}
		});

		// Add delay to ensure DOM is ready
		setTimeout(() => {
			navLinks.forEach((d) => {
				const element = document.querySelector(`#${d.hash}`);

				if (element) {
					observer.observe(element);
				}
			});
		}, 100);

		return () => {
			if (observerRef.current) {
				observerRef.current.disconnect();
			}
		};
	}, [pathname, homePath, activeHash]);

	const isActive = (path: string, hash?: string) => {
		if (pathname !== path) {
			return false;
		}

		if (hash) {
			return activeHash === hash;
		}

		return true;
	};

	return (
		<header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="container-custom">
				<div className="flex h-16 items-center justify-between">
					<Link
						href={Routes.get('home')}
						className="flex items-center gap-2"
					>
						<LogoComponent divClass="h-9 w-9" spanClass="text-lg" />
						<span className="text-xl font-semibold text-foreground">
							{Configuration.get('app.name')}
						</span>
					</Link>

					{/* Desktop Navigation */}
					<nav className="hidden md:flex items-center gap-1">
						{navLinks.map((link) => (
							<Link
								key={link.href}
								href={link.href}
								className={cn(
									'px-4 py-2 text-sm font-medium rounded-md transition-colors',
									isActive(link.href)
										? 'bg-accent text-accent-foreground'
										: 'text-muted-foreground hover:text-foreground hover:bg-muted',
								)}
							>
								{link.label}
							</Link>
						))}
					</nav>

					{/* Right side actions */}
					<div className="flex items-center gap-2">
						{/* Mobile menu button */}
						<Button
							variant="ghost"
							className="md:hidden h-10 w-10"
							onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
							aria-label="Toggle menu"
						>
							{mobileMenuOpen ? (
								<X className="h-5 w-5" />
							) : (
								<Menu className="h-5 w-5" />
							)}
						</Button>

						<ToggleTheme />
						<UserMenu />
					</div>
				</div>

				{/* Mobile menu */}
				{mobileMenuOpen && (
					<div className="md:hidden py-4 border-t border-border animate-fade-in">
						<nav className="flex flex-col gap-1">
							{navLinks.map((link) => (
								<Link
									key={link.href}
									href={link.href}
									onClick={() => setMobileMenuOpen(false)}
									className={cn(
										'px-4 py-3 text-sm font-medium rounded-md transition-colors',
										isActive(link.href)
											? 'bg-accent text-accent-foreground'
											: 'text-muted-foreground hover:text-foreground hover:bg-muted',
									)}
								>
									{link.label}
								</Link>
							))}
							{authStatus === 'unauthenticated' && (
								<div className="sm:hidden border-t border-border mt-2 pt-3 px-4 space-y-2">
									<Button
										variant="outline"
										className="w-full"
									>
										<Link
											href={Routes.get('login')}
											title="Sign in"
										>
											Login
										</Link>
									</Button>
									<Button className="w-full" asChild>
										<Link
											href={Routes.get('register')}
											title="Create an account"
										>
											Sign Up
										</Link>
									</Button>
								</div>
							)}
						</nav>
					</div>
				)}
			</div>
		</header>
	);
}
