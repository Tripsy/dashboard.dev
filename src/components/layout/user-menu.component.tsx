'use client';

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
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Routes from '@/config/routes.setup';
import { UserRoleEnum } from '@/models/user.model';
import { useAuth } from '@/providers/auth.provider';

export function UserMenu() {
	const { auth, authStatus } = useAuth();

	if (authStatus === 'loading') {
		return <LoadingIcon className="h-5 w-5" />;
	}

	if (authStatus === 'error') {
		return (
			<UserX
				className="h-5 w-5 text-error"
				aria-label="An error occurred while loading your account"
			/>
		);
	}

	if (!auth || authStatus === 'unauthenticated') {
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
				<DropdownMenu>
					<DropdownMenuTrigger asChild className="sm:hidden">
						<Button
							variant="ghost"
							className="flex items-center gap-2 h-10 px-2"
						>
							<User className="h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" className="w-48">
						<DropdownMenuItem>
							<Link
								href={Routes.get('login')}
								className="flex items-center gap-2"
								title="Sign in"
							>
								<KeyRound className="h-4 w-4" />
								Login
							</Link>
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem>
							<Link
								href={Routes.get('register')}
								className="flex items-center gap-2"
								title="Create an account"
							>
								<UserPlus className="h-4 w-4" />
								Sign Up
							</Link>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</>
		);
	}

	if (authStatus === 'authenticated') {
		return (
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						variant="ghost"
						className="flex items-center gap-2 h-10 px-2"
					>
						<div className="h-8 w-8 bg-primary text-primary-foreground text-sm shrink-0 overflow-hidden flex items-center justify-center rounded-full">
							{auth.name.charAt(0).toUpperCase()}
						</div>
						<span className="text-sm font-medium">{auth.name}</span>
						<ChevronDown className="h-4 w-4 text-muted-foreground" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" className="w-48">
					<DropdownMenuItem>
						<Link
							href={Routes.get('account-me')}
							className="flex items-center gap-2"
							title="My account"
						>
							<User className="h-4 w-4" />
							My account
						</Link>
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					{auth?.role &&
						[UserRoleEnum.ADMIN, UserRoleEnum.OPERATOR].includes(
							auth.role,
						) && (
							<>
								<DropdownMenuItem>
									<Link
										href={Routes.get('dashboard')}
										className="flex items-center gap-2"
										title="Go to administration"
									>
										<LayoutDashboard className="h-4 w-4" />
										Dashboard
									</Link>
								</DropdownMenuItem>
								<DropdownMenuSeparator />
							</>
						)}
					<DropdownMenuItem className="text-error">
						<Link
							href={Routes.get('logout')}
							className="flex items-center gap-2"
							prefetch={false}
							title="Sign out"
						>
							<LogOut className="h-4 w-4" />
							Logout
						</Link>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		);
	}
}
