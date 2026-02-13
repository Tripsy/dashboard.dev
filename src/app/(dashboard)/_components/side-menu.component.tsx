'use client';

import { ArrowDown, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { type ComponentType, useLayoutEffect, useMemo, useState } from 'react';
import { useSideMenu } from '@/app/(dashboard)/_providers/side-menu.provider';
import { Icons } from '@/components/icon.component';
import { Button } from '@/components/ui/button';
import Routes from '@/config/routes.setup';
import { cn } from '@/helpers/css.helper';
import { useDebouncedEffect } from '@/hooks/use-debounced-effect.hook';
import { useTranslation } from '@/hooks/use-translation.hook';
import { hasPermission } from '@/models/auth.model';
import { useAuth } from '@/providers/auth.provider';

export function SideMenu() {
	const { auth } = useAuth();
	const { status: menuStatus, toggle: menuToggle } = useSideMenu();

	const translationsKeys = useMemo(
		() =>
			[
				'dashboard.labels.content',
				'dashboard.labels.settings',
				'dashboard.labels.logs',
				'dashboard.labels.templates',
				'dashboard.labels.log_data',
				'dashboard.labels.log_history',
				'dashboard.labels.cron_history',
				'dashboard.labels.mail_queue',
				'dashboard.labels.permissions',
				'dashboard.labels.users',
			] as const,
		[],
	);

	const { translations, isTranslationLoading } =
		useTranslation(translationsKeys);

	// Memoize the menu groups to prevent unnecessary re-renders
	const menuContent = useMemo(() => {
		if (isTranslationLoading) {
			return [];
		}

		const parts: SideMenuPartProps[] = [
			// {
			// 	key: 'content',
			// 	label: translations['dashboard.labels.content'],
			// 	icon: Container,
			// 	items: [
			// 		{
			// 			href: '',
			// 			label: 'Projects',
			// 			icon: faDiagramProject,
			// 			permission: true,
			// 		},
			// 	],
			// },
			{
				label: 'settings',
				text: translations['dashboard.labels.settings'],
				icon: Icons.Settings,
				items: [
					{
						label: 'templates',
						href: Routes.get('template'),
						text: translations['dashboard.labels.templates'],
						icon: Icons.Template,
						permission: hasPermission(auth, 'template.find'),
					},
				],
			},
			{
				label: 'logs',
				text: translations['dashboard.labels.logs'],
				icon: Icons.Logs,
				isPartOpen: true,
				items: [
					{
						label: 'log-data',
						href: Routes.get('log-data'),
						text: translations['dashboard.labels.log_data'],
						icon: Icons.HardDrive,
						permission: hasPermission(auth, 'log_data.find'),
					},
					{
						label: 'log-history',
						href: Routes.get('log-history'),
						text: translations['dashboard.labels.log_history'],
						icon: Icons.History,
						permission: hasPermission(auth, 'log_history.find'),
					},
					{
						label: 'cron-history',
						href: Routes.get('cron-history'),
						text: translations['dashboard.labels.cron_history'],
						icon: Icons.Cron,
						permission: hasPermission(auth, 'cron_history.find'),
					},
					{
						label: 'mail-queue',
						href: Routes.get('mail-queue'),
						text: translations['dashboard.labels.mail_queue'],
						icon: Icons.Mails,
						permission: hasPermission(auth, 'mail_queue.find'),
					},
				],
			},
			{
				label: 'user-management',
				text: translations['dashboard.labels.users'],
				icon: Icons.Account,
				isPartOpen: true,
				items: [
					{
						label: 'users',
						href: Routes.get('user'),
						text: translations['dashboard.labels.users'],
						icon: Icons.Users,
						permission: hasPermission(auth, 'user.find'),
					},
					{
						label: 'permissions',
						href: Routes.get('permission'),
						text: translations['dashboard.labels.permissions'],
						icon: Icons.Permission,
						permission: hasPermission(auth, 'permission.find'),
					},
				],
			},
		];

		return parts
			.filter((part) => part.items.some((item) => item.permission))
			.map((part) => (
				<SideMenuPartOpen
					key={`side-menu-part-${part.label}`}
					{...part}
				/>
			));
	}, [auth, isTranslationLoading, translations]);

	return (
		<div className="side-menu-section">
			<div className="flex flex-col h-full">
				<div className="flex justify-end p-2">
					<Button
						variant="ghost"
						onClick={menuToggle}
						className="h-8 w-8 rounded-md"
					>
						{menuStatus === 'closed' ? (
							<ChevronRight className="h-4 w-4" />
						) : (
							<ChevronLeft className="h-4 w-4" />
						)}
					</Button>
				</div>

				<nav aria-description="Side menu" className="side-menu-content">
					{menuContent}
				</nav>

				{menuStatus === 'open' && (
					<div className="p-4 border-t border-sidebar-border">
						<div className="rounded-lg bg-sidebar-accent p-4">
							<p className="text-sm font-medium text-sidebar-accent-foreground mb-1">
								Need help?
							</p>
							<p className="text-xs text-muted-foreground mb-3">
								Check our documentation for guidance.
							</p>
							<Button
								size="sm"
								variant="secondary"
								className="w-full"
								asChild
							>
								<Link
									href={Routes.get('docs')}
									title="Check out the documentation"
								>
									View Docs
								</Link>
							</Button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

type SideMenuPartProps = {
	isPartOpen?: boolean;
	label: string;
	text: string;
	icon: ComponentType<{ className?: string }>;
	items: {
		label: string;
		href: string;
		text: string;
		icon: ComponentType<{ className?: string }>;
		permission: boolean;
	}[];
};

type SideMenuPartOpenProps = Omit<SideMenuPartProps, 'items' | 'icon'> & {
	selected?: string;
	items: {
		label: string;
		href: string;
		text: string;
		icon: ComponentType<{ className?: string }>;
	}[];
};

function SideMenuPartOpen({
	isPartOpen = false,
	selected,
	label,
	text,
	items,
}: SideMenuPartOpenProps) {
	const keyStorage = `side-menu-open-${label}`;

	const [open, setOpen] = useState<boolean>(() => isPartOpen);

	useLayoutEffect(() => {
		const openStorage: string | null = localStorage.getItem(keyStorage);

		if (openStorage !== null && openStorage !== 'undefined') {
			setOpen(JSON.parse(openStorage));
		}
	}, [keyStorage]);

	useDebouncedEffect(
		() => {
			localStorage.setItem(keyStorage, JSON.stringify(open));
		},
		[open],
		1000,
	);

	const handleToggle = (e: React.MouseEvent<HTMLElement>) => {
		e.preventDefault();

		setOpen((previousState) => !previousState);
	};

	if (items.length === 0) {
		return null;
	}

	return (
		<div className="side-menu-part">
			<button
				type="button"
				onClick={handleToggle}
				className="flex items-center text-left gap-2 px-3 py-2.5 w-full transition-all duration-200 text-sidebar-foreground hover:bg-sidebar-accent"
			>
				{open ? (
					<ArrowDown className="h-4 w-4 flex-shrink-0" />
				) : (
					<ArrowRight className="h-4 w-4 flex-shrink-0" />
				)}
				<span className="flex-1 truncate">{text}</span>
			</button>
			<div
				className={cn(
					'transition-all duration-300 ease-in-out',
					open
						? 'max-h-96 opacity-100 translate-y-0'
						: 'max-h-0 opacity-0 -translate-y-2 overflow-hidden',
				)}
			>
				<ul className="ml-6 py-1">
					{items.map((item) => (
						<li key={`side-menu-item-${item.label}`}>
							<Link
								href={item.href}
								className="flex items-center text-left gap-2 px-3 py-2 text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
							>
								<item.icon className="h-4 w-4 flex-shrink-0" />{' '}
								{item.text}
							</Link>
						</li>
					))}
				</ul>
			</div>
		</div>
	);
}

// function SideMenuPartOpen({
// 	isPartOpen = false,
// 	selected,
// 	label,
// 	text,
// 	icon: PartIcon,
// 	items,
// }: SideMenuPartOpenProps) {
// 	const keyStorage = `side-menu-open-${label}`;
//
// 	const [open, setOpen] = useState<boolean>(() => isPartOpen);
//
// 	useLayoutEffect(() => {
// 		const openStorage: string | null = localStorage.getItem(keyStorage);
//
// 		if (openStorage !== null && openStorage !== 'undefined') {
// 			setOpen(JSON.parse(openStorage));
// 		}
// 	}, [keyStorage]);
//
// 	useDebouncedEffect(
// 		() => {
// 			localStorage.setItem(keyStorage, JSON.stringify(open));
// 		},
// 		[open],
// 		1000,
// 	);
//
// 	const handleToggle = (e: React.MouseEvent<HTMLElement>) => {
// 		e.preventDefault();
//
// 		setOpen((previousState) => !previousState);
// 	};
//
// 	if (items.length === 0) {
// 		return null;
// 	}
//
// 	return (
// 		<div className="side-menu-part">
// 			<button
// 				onClick={handleToggle}
// 				className="flex items-center text-left gap-2 px-3 py-2.5 w-full transition-all duration-200 text-sidebar-foreground hover:bg-sidebar-accent"
// 			>
// 				{/*<PartIcon*/}
// 				{/*	className={cn(*/}
// 				{/*		'h-5 w-5 flex-shrink-0',*/}
// 				{/*		isPartSelected && 'text-sidebar-primary',*/}
// 				{/*	)}*/}
// 				{/*/>*/}
// 				{open ? (
// 					<ArrowDown className="h-4 w-4 flex-shrink-0" />
// 				) : (
// 					<ArrowRight className="h-4 w-4 flex-shrink-0" />
// 				)}
// 				<span className="flex-1 truncate">{text}</span>
// 			</button>
// 			{open && (
// 				<ul className="ml-6">
// 					{items.map(({ label: itemLabel, href, text, icon: ItemIcon }) => (
// 						<li
// 							key={`side-menu-item-${itemLabel}`}
// 						>
// 							<Link
// 								href={href}
// 								className="flex items-center text-left gap-2 px-3 py-2 text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
// 							>
// 								<ItemIcon className="h-4 w-4 flex-shrink-0" />{' '}
// 								{text}
// 							</Link>
// 						</li>
// 					))}
// 				</ul>
// 			)}
//
// 			{/*isPartSelected*/}
// 			{/*? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'*/}
// 			{/*: '',*/}
// 		</div>
// 	);
// }
