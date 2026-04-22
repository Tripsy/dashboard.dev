import { useMemo } from 'react';
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

	const { translations } = useTranslation(translationsKeys);

	const ActionIcon = getActionIcon(action);

	return (
		<Button
			type="button"
			variant={buttonProps?.variant}
			hover={buttonProps?.hover}
			size={buttonProps?.size}
			className={buttonProps?.className}
			title={translations[actionTitleKey]}
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
					<ActionIcon />
					{translations[actionLabelKey]}
				</>
			)}
		</Button>
	);
}
