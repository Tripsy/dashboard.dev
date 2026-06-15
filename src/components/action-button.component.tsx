import type { LucideProps } from 'lucide-react';
import Link from 'next/link';
import React, { type JSX, useMemo } from 'react';
import { getActionIcon } from '@/components/icon.component';
import { LoadingIcon } from '@/components/status.component';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/use-translation.hook';
import type { ButtonAppearanceType } from '@/types/html.type';

type ActionCommand = {
	type: 'action';
	onClick: () => void;
};

type LinkCommand = {
	type: 'link';
	href: string;
	target?: string;
};

export type ButtonCommand = ActionCommand | LinkCommand;

function ActionButtonContent({
	icon,
	label,
}: {
	icon: React.ReactElement | React.ComponentType<LucideProps> | null;
	label: string | JSX.Element;
}) {
	return (
		<>
			{icon && React.isValidElement(icon)
				? icon
				: icon &&
					React.createElement(
						icon as React.ComponentType<LucideProps>,
					)}
			{label}
		</>
	);
}

export function ActionButton({
	dataSource,
	action,
	buttonAppearance,
	disabled = false,
	command,
}: {
	dataSource: string;
	action: string;
	buttonAppearance?: ButtonAppearanceType;
	disabled?: boolean;
	command: ButtonCommand;
}) {
	const actionTitleKey = `${dataSource}.action.${action}.title`;
	const actionLabelKey = `${dataSource}.action.${action}.label`;

	const translationsKeys = useMemo(
		() => [actionTitleKey, actionLabelKey, 'app.text.please_wait'] as const,
		[actionLabelKey, actionTitleKey],
	);

	const { translations, isTranslationLoading } =
		useTranslation(translationsKeys);

	let ActionIcon:
		| React.ReactElement
		| React.ComponentType<LucideProps>
		| null;

	if (buttonAppearance?.icon) {
		if (React.isValidElement(buttonAppearance.icon)) {
			ActionIcon = buttonAppearance.icon;
		} else {
			ActionIcon = getActionIcon(buttonAppearance.icon);
		}
	} else {
		ActionIcon = getActionIcon(action);
	}

	if (isTranslationLoading) {
		return null;
	}

	const label = buttonAppearance?.label || translations[actionLabelKey];
	const title = translations[actionTitleKey].replace(' - {{entry}}', '');

	return (
		<Button
			type="button"
			variant={buttonAppearance?.variant}
			hover={buttonAppearance?.hover}
			size={buttonAppearance?.size}
			className={buttonAppearance?.className}
			title={title}
			onClick={command.type === 'action' ? command.onClick : undefined}
			disabled={disabled}
			asChild={command.type === 'link'}
		>
			{disabled ? (
				<>
					<LoadingIcon />
					{translations['app.text.please_wait']}
				</>
			) : command.type === 'link' ? (
				<Link href={command.href} target={command.target ?? '_self'}>
					<ActionButtonContent icon={ActionIcon} label={label} />
				</Link>
			) : (
				<ActionButtonContent icon={ActionIcon} label={label} />
			)}
		</Button>
	);
}
