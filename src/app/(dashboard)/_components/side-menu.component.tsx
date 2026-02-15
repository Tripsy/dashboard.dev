'use client';

import { ArrowDown, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import React, {
	type ComponentType,
	useLayoutEffect,
	useMemo,
	useState,
} from 'react';
import {
	type SelectedPageType,
	useBreadcrumb,
} from '@/app/(dashboard)/_providers/breadcrumb.provider';
import { useSideMenu } from '@/app/(dashboard)/_providers/side-menu.provider';
import { Icons } from '@/components/icon.component';
import { Button } from '@/components/ui/button';
import type { DataSourceKey } from '@/config/data-source.config';
import Routes from '@/config/routes.setup';
import { cn } from '@/helpers/css.helper';
import { useDebouncedEffect } from '@/hooks/use-debounced-effect.hook';
import { useTranslation } from '@/hooks/use-translation.hook';
import { hasPermission } from '@/models/auth.model';
import { useAuth } from '@/providers/auth.provider';
import {Tooltip} from "@radix-ui/react-tooltip";
import {TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip";

type SideMenuSectionProps = {
	isExpanded?: boolean;
	label: string;
	text: string;
	icon: ComponentType<{ className?: string }>;
	items: {
		page: DataSourceKey;
		href: string;
		text: string;
		icon: ComponentType<{ className?: string }>;
		permission: boolean;
	}[];
};

type SideMenuOpenSectionProps = Omit<SideMenuSectionProps, 'items' | 'icon'> & {
	selectedPage: SelectedPageType;
	items: {
		page: DataSourceKey;
		href: string;
		text: string;
		icon: ComponentType<{ className?: string }>;
	}[];
};

type SideMenuClosedSectionProps = Omit<SideMenuSectionProps, 'items'> & {
	selectedPage: SelectedPageType;
	items: {
		page: DataSourceKey;
		href: string;
		text: string;
		icon: ComponentType<{ className?: string }>;
	}[];
};

type SectionStateType = 'expanded' | 'collapsed';

export function SideMenu() {
	const { auth } = useAuth();
	const { menuState, menuToggle } = useSideMenu();
	const { selectedPage } = useBreadcrumb();

	const translationsKeys = useMemo(
		() =>
			[
				'dashboard.labels.content',
				'dashboard.labels.settings',
				'dashboard.labels.logs',
				'dashboard.labels.templates',
				'dashboard.labels.log-data',
				'dashboard.labels.log-history',
				'dashboard.labels.cron-history',
				'dashboard.labels.mail-queue',
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

		const sections: SideMenuSectionProps[] = [
			{
				label: 'settings',
				text: translations['dashboard.labels.settings'],
				icon: Icons.Settings,
				items: [
					{
						page: 'templates',
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
				isExpanded: true,
				items: [
					{
						page: 'log-data',
						href: Routes.get('log-data'),
						text: translations['dashboard.labels.log-data'],
						icon: Icons.HardDrive,
						permission: hasPermission(auth, 'log-data.find'),
					},
					{
						page: 'log-history',
						href: Routes.get('log-history'),
						text: translations['dashboard.labels.log-history'],
						icon: Icons.History,
						permission: hasPermission(auth, 'log-history.find'),
					},
					{
						page: 'cron-history',
						href: Routes.get('cron-history'),
						text: translations['dashboard.labels.cron-history'],
						icon: Icons.Cron,
						permission: hasPermission(auth, 'cron-history.find'),
					},
					{
						page: 'mail-queue',
						href: Routes.get('mail-queue'),
						text: translations['dashboard.labels.mail-queue'],
						icon: Icons.Mails,
						permission: hasPermission(auth, 'mail-queue.find'),
					},
				],
			},
			{
				label: 'user-management',
				text: translations['dashboard.labels.users'],
				icon: Icons.Account,
				isExpanded: true,
				items: [
					{
						page: 'users',
						href: Routes.get('user'),
						text: translations['dashboard.labels.users'],
						icon: Icons.Users,
						permission: hasPermission(auth, 'user.find'),
					},
					{
						page: 'permissions',
						href: Routes.get('permission'),
						text: translations['dashboard.labels.permissions'],
						icon: Icons.Permission,
						permission: hasPermission(auth, 'permission.find'),
					},
				],
			},
		];

		const displaySections = sections.filter((section) =>
			section.items.some((item) => item.permission),
		);

		if (menuState === 'open') {
			return displaySections.map((section) => (
				<SideMenuOpenSection
					key={`side-menu-section-${section.label}`}
					selectedPage={selectedPage}
					{...section}
				/>
			));
		}

		return displaySections.map((section) => (
			<SideMenuClosedSection
				key={`side-menu-section-${section.label}`}
				selectedPage={selectedPage}
				{...section}
			/>
		));
	}, [auth, isTranslationLoading, translations, menuState, selectedPage]);

	return (
		<div className="side-menu-container">
			<div className="flex flex-col h-full">
				{/*<div className="flex justify-end p-2">*/}
				{/*	<Button*/}
				{/*		variant="ghost"*/}
				{/*		onClick={menuToggle}*/}
				{/*		className="h-8 w-8 rounded-md"*/}
				{/*	>*/}
				{/*		{menuState === 'closed' ? (*/}
				{/*			<ChevronRight className="h-4 w-4" />*/}
				{/*		) : (*/}
				{/*			<ChevronLeft className="h-4 w-4" />*/}
				{/*		)}*/}
				{/*	</Button>*/}
				{/*</div>*/}

				<nav aria-description="Side menu" className="side-menu-content">
					{menuState === 'open' ? menuContent : (
						<TooltipProvider delayDuration={0}>
							{menuContent}
						</TooltipProvider>
					)}
				</nav>

				{menuState === 'open' && (
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

function SideMenuOpenSection({
	isExpanded = false,
	label,
	text,
	items,
	selectedPage,
}: SideMenuOpenSectionProps) {
	const keyStorageSectionState = `side-menu-section-state-${label}`;

	const [sectionState, setSectionState] = useState<SectionStateType>(() =>
		isExpanded ? 'expanded' : 'collapsed',
	);

	useLayoutEffect(() => {
		const storageSectionState: string | null = localStorage.getItem(
			keyStorageSectionState,
		);

		if (
			storageSectionState !== null &&
			storageSectionState !== 'undefined'
		) {
			setSectionState(storageSectionState as SectionStateType);
		}
	}, [keyStorageSectionState]);

	useDebouncedEffect(
		() => {
			localStorage.setItem(keyStorageSectionState, sectionState);
		},
		[sectionState],
		1000,
	);

	const toggleSectionState = (e: React.MouseEvent<HTMLElement>) => {
		e.preventDefault();

		setSectionState((previousState) =>
			previousState === 'expanded' ? 'collapsed' : 'expanded',
		);
	};

	if (items.length === 0) {
		return null;
	}

	return (
		<div>
			<button
				type="button"
				onClick={toggleSectionState}
				className="flex items-center text-left gap-2 px-3 py-2.5 w-full transition-all duration-200 text-sidebar-foreground hover:bg-sidebar-accent"
			>
				{sectionState === 'expanded' ? (
					<ArrowDown className="h-4 w-4 flex-shrink-0" />
				) : (
					<ArrowRight className="h-4 w-4 flex-shrink-0" />
				)}
				<span className="flex-1 truncate">{text}</span>
			</button>
			<div
				className={cn(
					'transition-all duration-300 ease-in-out',
					sectionState === 'expanded'
						? 'max-h-96 opacity-100 translate-y-0'
						: 'max-h-0 opacity-0 -translate-y-2 overflow-hidden',
				)}
			>
				<ul className="ml-6 py-1">
					{items.map((item) => (
						<li key={`side-menu-item-${item.page}`}>
							<Link
								href={item.href}
								className={cn(
									'flex items-center text-left gap-2 px-3 py-2 transition-all duration-200 group',
									selectedPage === item.page
										? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
										: 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground',
								)}
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

function SideMenuClosedSection({
	label,
	text,
	icon: SectionIcon,
	items,
	selectedPage
}: SideMenuClosedSectionProps) {
	if (items.length === 0) {
		return null;
	}

	const isSelected: boolean = items.some((item) => item.page === selectedPage);

	return (
		<Tooltip key={`tooltip-${label}`} delayDuration={0}>
			<TooltipTrigger asChild>
				<div
					className={cn(
						"flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
						isSelected
							? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
							: "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
					)}
					aria-description={text}
				>
					<SectionIcon
						className={cn(
							'h-5 w-5 flex-shrink-0',
							isSelected && 'text-sidebar-primary',
						)}
					/>
				</div>
			</TooltipTrigger>
			<TooltipContent side="right" align="start" className="flex items-center gap-2">
				<ul className="py-1">
					{items.map((item) => (
						<li key={`side-menu-item-${item.page}`}>
							<Link
								href={item.href}
								className={cn(
									'flex items-center text-left gap-2 px-3 py-2 transition-all duration-200 group',
									selectedPage === item.page
										? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
										: 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground',
								)}
							>
								<item.icon className="h-4 w-4 flex-shrink-0" />{' '}
								{item.text}
							</Link>
						</li>
					))}
				</ul>
			</TooltipContent>
		</Tooltip>
	);
}