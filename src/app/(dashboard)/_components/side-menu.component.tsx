'use client';

import {
	faDatabase,
	faDiagramProject,
	faEnvelopesBulk,
	faFileContract,
	faFileLines,
	faFileWaveform,
	faUserGroup,
	faUserLock,
	type IconDefinition,
} from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';
import React, { useLayoutEffect, useMemo, useState } from 'react';
import { AwesomeIcon } from '@/components/icon.component';
import Routes from '@/config/routes.setup';
import { useDebouncedEffect } from '@/hooks/use-debounced-effect.hook';
import { useTranslation } from '@/hooks/use-translation.hook';
import { hasPermission } from '@/models/auth.model';
import { useAuth } from '@/providers/auth.provider';

type SideMenuGroupProps = {
	groupKey: string;
	title: string;
	defaultOpen?: boolean;
	children: React.ReactNode;
};

function SideMenuGroup({
	groupKey,
	title,
	defaultOpen = false,
	children,
}: SideMenuGroupProps) {
	const groupKeyStorage = `side-menu-open-${groupKey}`;

	const [open, setOpen] = useState<boolean>(() => defaultOpen);

	useLayoutEffect(() => {
		const openStorage: string | null =
			localStorage.getItem(groupKeyStorage);

		if (openStorage !== null && openStorage !== 'undefined') {
			setOpen(JSON.parse(openStorage));
		}
	}, [groupKeyStorage]);

	useDebouncedEffect(
		() => {
			localStorage.setItem(groupKeyStorage, JSON.stringify(open));
		},
		[open],
		1000,
	);

	const handleToggle = (e: React.MouseEvent<HTMLElement>) => {
		e.preventDefault();

		setOpen((previousState) => !previousState);
	};

	const validChildren = React.Children.toArray(children).filter(Boolean);

	if (validChildren.length === 0) {
		return null;
	}

	return (
		<details open={open} className="side-menu-group">
			{/*biome-ignore lint/a11y/useSemanticElements: Skip button suggestion*/}
			<summary
				className="side-menu-group-title"
				onClick={handleToggle}
				role="button"
			>
				{title}
			</summary>
			<ul>{validChildren}</ul>
		</details>
	);
}

type SideMenuItemProps = {
	href: string;
	label: string;
	icon: IconDefinition;
};

function SideMenuGroupItem({ href, label, icon }: SideMenuItemProps) {
	return (
		<li>
			<Link href={href}>
				<AwesomeIcon icon={icon} className="inline-block mr-0.75" />
				{label}
			</Link>
		</li>
	);
}

export function SideMenu() {
	const { auth } = useAuth();

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
	const menuGroups = useMemo(() => {
		if (isTranslationLoading) {
			return [];
		}

		const groups = [
			{
				key: 'content',
				title: translations['dashboard.labels.content'],
				items: [
					{
						href: '',
						label: 'Projects',
						icon: faDiagramProject,
						permission: true,
					},
				],
			},
			{
				key: 'settings',
				title: translations['dashboard.labels.settings'],
				items: [
					{
						href: Routes.get('template'),
						label: translations['dashboard.labels.templates'],
						icon: faFileLines,
						permission: hasPermission(auth, 'template.find'),
					},
				],
			},
			{
				key: 'logs',
				title: translations['dashboard.labels.logs'],
				items: [
					{
						href: Routes.get('log-data'),
						label: translations['dashboard.labels.log_data'],
						icon: faDatabase,
						permission: hasPermission(auth, 'log_data.find'),
					},
					{
						href: Routes.get('log-history'),
						label: translations['dashboard.labels.log_history'],
						icon: faFileWaveform,
						permission: hasPermission(auth, 'log_history.find'),
					},
					{
						href: Routes.get('cron-history'),
						label: translations['dashboard.labels.cron_history'],
						icon: faFileContract,
						permission: hasPermission(auth, 'cron_history.find'),
					},
					{
						href: Routes.get('mail-queue'),
						label: translations['dashboard.labels.mail_queue'],
						icon: faEnvelopesBulk,
						permission: hasPermission(auth, 'mail_queue.find'),
					},
				],
			},
			{
				key: 'users',
				title: translations['dashboard.labels.users'],
				defaultOpen: true,
				items: [
					{
						href: Routes.get('user'),
						label: translations['dashboard.labels.users'],
						icon: faUserGroup,
						permission: hasPermission(auth, 'user.find'),
					},
					{
						href: Routes.get('permission'),
						label: translations['dashboard.labels.permissions'],
						icon: faUserLock,
						permission: hasPermission(auth, 'permission.find'),
					},
				],
			},
		];

		return groups
			.filter((group) => group.items.some((item) => item.permission))
			.map((group) => (
				<SideMenuGroup
					key={`side-menu-${group.key}`}
					groupKey={`side-menu-${group.key}`}
					title={group.title}
					defaultOpen={group.defaultOpen}
				>
					{group.items.map(
						(item) =>
							item.permission && (
								<SideMenuGroupItem
									key={`side-menu-${group.key}-${item.label}`}
									href={item.href}
									label={item.label}
									icon={item.icon}
								/>
							),
					)}
				</SideMenuGroup>
			));
	}, [auth, isTranslationLoading, translations]);

	return <nav className="side-menu-section">{menuGroups}</nav>;
}
