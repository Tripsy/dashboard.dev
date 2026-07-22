'use client';

import { Dropdown } from '@heroui/react';
import {
	ChevronDown,
	KeyRound,
	LayoutDashboard,
	LogOut,
	User,
	UserPlus,
	UserX,
} from 'lucide-react';
import Link from 'next/link';
import { LoadingIcon } from '@/components/status.component';
import { Button } from '@/components/ui/button';
import Routes from '@/config/routes.setup';
import { useAuth } from '@/providers/auth.provider';

const triggerClass =
	'flex items-center gap-2 h-10 px-2 rounded-md hover:bg-surface-secondary';
const itemClass = 'flex items-center gap-2';

export function UserMenu() {
	const { auth, authStatus } = useAuth();

	if (authStatus === 'loading') {
		return <LoadingIcon className="h-5 w-5" />;
	}

	if (authStatus === 'error') {
		return (
			<UserX
				className="h-5 w-5 text-danger"
				aria-label="An error occurred while loading your account"
			/>
		);
	}

	if (authStatus === 'unauthenticated') {
		return (
			<>
				{/* Desktop version */}
				<div className="hidden sm:block space-x-2">
					<Button variant="ghost">
						<Link href={Routes.get('login')} title="Sign in">
							Login
						</Link>
					</Button>
					<Button>
						<Link
							href={Routes.get('register')}
							title="Create an account"
						>
							Sign Up
						</Link>
					</Button>
				</div>

				{/* Mobile version */}
				<Dropdown>
					<Dropdown.Trigger className={`sm:hidden ${triggerClass}`}>
						<User className="h-4 w-4" />
					</Dropdown.Trigger>
					<Dropdown.Popover placement="bottom end" className="w-48">
						<Dropdown.Menu>
							<Dropdown.Item
								id={Routes.get('login')}
								href={Routes.get('login')}
								textValue="Login"
								className={itemClass}
							>
								<KeyRound className="h-4 w-4" /> Login
							</Dropdown.Item>
							<Dropdown.Item
								id={Routes.get('register')}
								href={Routes.get('register')}
								textValue="Sign Up"
								className={itemClass}
							>
								<UserPlus className="h-4 w-4" /> Sign Up
							</Dropdown.Item>
						</Dropdown.Menu>
					</Dropdown.Popover>
				</Dropdown>
			</>
		);
	}

	if (authStatus === 'authenticated' && auth) {
		return (
			<Dropdown>
				<Dropdown.Trigger className={triggerClass}>
					<div className="h-8 w-8 bg-accent text-accent-foreground text-sm shrink-0 overflow-hidden flex items-center justify-center rounded-full">
						{auth.name.charAt(0).toUpperCase()}
					</div>
					<span className="text-sm font-medium hidden sm:inline-block">
						{auth.name}
					</span>
					<ChevronDown className="h-4 w-4 text-muted" />
				</Dropdown.Trigger>
				<Dropdown.Popover placement="bottom end" className="w-48">
					<Dropdown.Menu>
						<Dropdown.Item
							id={Routes.get('account-me')}
							href={Routes.get('account-me')}
							textValue="My account"
							className={itemClass}
						>
							<User className="h-4 w-4" /> My account
						</Dropdown.Item>
						<Dropdown.Item
							id={Routes.get('dashboard')}
							href={Routes.get('dashboard')}
							textValue="Dashboard"
							className={itemClass}
						>
							<LayoutDashboard className="h-4 w-4" /> Dashboard
						</Dropdown.Item>
						<Dropdown.Item
							id={Routes.get('logout')}
							href={Routes.get('logout')}
							textValue="Logout"
							className={`${itemClass} text-danger`}
						>
							<LogOut className="h-4 w-4" /> Logout
						</Dropdown.Item>
					</Dropdown.Menu>
				</Dropdown.Popover>
			</Dropdown>
		);
	}
}
