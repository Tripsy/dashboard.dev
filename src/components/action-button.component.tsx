import type { LucideProps } from 'lucide-react';
import React, { useMemo } from 'react';
import { getActionIcon } from '@/components/icon.component';
import { LoadingIcon } from '@/components/status.component';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/use-translation.hook';
import type { ActionButtonPropsType } from '@/types/html.type';

export function ActionButton({
	dataSource,
	action,
	buttonProps,
	handleClick,
	disabled = false,
}: {
	dataSource: string;
	action: string;
	buttonProps?: ActionButtonPropsType;
	handleClick: () => void;
	disabled?: boolean;
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

	if (buttonProps?.icon) {
		if (React.isValidElement(buttonProps.icon)) {
			ActionIcon = buttonProps.icon;
		} else {
			// is string - use it as action
			ActionIcon = getActionIcon(buttonProps.icon);
		}
	} else {
		ActionIcon = getActionIcon(action);
	}

	if (isTranslationLoading) {
		return null;
	}

	return (
		<Button
			type="button"
			variant={buttonProps?.variant}
			hover={buttonProps?.hover}
			size={buttonProps?.size}
			className={buttonProps?.className}
			title={translations[actionTitleKey].replace(' - {{entry}}', '')}
			onClick={handleClick}
			disabled={disabled}
		>
			{disabled ? (
				<>
					<LoadingIcon />
					{translations['app.text.please_wait']}
				</>
			) : (
				<>
					{ActionIcon && React.isValidElement(ActionIcon)
						? ActionIcon
						: ActionIcon && <ActionIcon />}
					{translations[actionLabelKey]}
				</>
			)}
		</Button>
	);
}
