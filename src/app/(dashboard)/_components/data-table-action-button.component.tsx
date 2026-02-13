import { useMemo } from 'react';
import { getActionIcon } from '@/components/icon.component';
import { LoadingIcon } from '@/components/status.component';
import { Button } from '@/components/ui/button';
import type {
	DataSourceKey,
	DataTableActionButtonPropsType,
} from '@/config/data-source.config';
import { useTranslation } from '@/hooks/use-translation.hook';

export function DataTableActionButton<K extends DataSourceKey>({
	dataSource,
	actionName,
	buttonProps,
	handleClick,
	disabled = false,
}: {
	dataSource: K;
	actionName: string;
	buttonProps?: DataTableActionButtonPropsType;
	handleClick: () => void;
	disabled?: boolean;
}) {
	const actionTitleKey = `${dataSource}.action.${actionName}.title`;
	const actionLabelKey = `${dataSource}.action.${actionName}.label`;

	const translationsKeys = useMemo(
		() => [actionTitleKey, actionLabelKey, 'app.text.please_wait'] as const,
		[actionLabelKey, actionTitleKey],
	);

	const { translations } = useTranslation(translationsKeys);

	const ActionIcon = getActionIcon(actionName);

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
