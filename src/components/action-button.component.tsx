import type { LucideProps } from 'lucide-react';
import Link from 'next/link';
import type { JSX } from 'react';
import React from 'react';
import { getActionIcon } from '@/components/icon.component';
import { LoadingIcon } from '@/components/status.component';
import { Button } from '@/components/ui/button';
import { capitalizeFirstLetter } from '@/helpers/string.helper';
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

export function ActionButtonContent({
	icon,
	action,
	label,
}: {
	icon?: React.ReactElement | React.ComponentType<LucideProps> | string;
	action: string;
	label: string | JSX.Element;
}) {
	const iconSource = icon || action;

	let iconElement: React.ReactElement | null = null;

	if (React.isValidElement(iconSource)) {
		// Already a JSX element
		iconElement = iconSource;
	} else if (typeof iconSource === 'string') {
		const IconComponent = getActionIcon(iconSource);

		if (IconComponent) {
			iconElement = <IconComponent className="h-4 w-4" />;
		}
	} else if (iconSource) {
		// A component type was passed directly — covers plain function
		// components, class components, and forwardRef/memo wrapper objects
		const IconComponent = iconSource as React.ComponentType<LucideProps>;

		iconElement = <IconComponent className="h-4 w-4" />;
	}

	return (
		<>
			{iconElement}
			{label}
		</>
	);
}

export function ActionButton({
	action,
	buttonAppearance,
	disabled = false,
	command,
}: {
	action: string;
	buttonAppearance?: ButtonAppearanceType;
	disabled?: boolean;
	command: ButtonCommand;
}) {
	const label = buttonAppearance?.label ?? capitalizeFirstLetter(action);
	const title = buttonAppearance?.title
		? buttonAppearance.title.replace(' - {{entry}}', '')
		: buttonAppearance?.label && typeof buttonAppearance?.label === 'string'
			? buttonAppearance.label
			: capitalizeFirstLetter(action);

	return (
		<Button
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
					{buttonAppearance?.loadingLabel ?? 'Please wait...'}
				</>
			) : command.type === 'link' ? (
				<Link href={command.href} target={command.target ?? '_self'}>
					<ActionButtonContent
						icon={buttonAppearance?.icon}
						action={action}
						label={label}
					/>
				</Link>
			) : (
				<ActionButtonContent
					icon={buttonAppearance?.icon}
					action={action}
					label={label}
				/>
			)}
		</Button>
	);
}
