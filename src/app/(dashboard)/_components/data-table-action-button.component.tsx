import { useMemo } from 'react';
import { getActionIcon } from '@/components/icon.component';
import { LoadingIcon } from '@/components/status.component';
import type { DataSourceKey } from '@/config/data-source.config';
import { useTranslation } from '@/hooks/use-translation.hook';

export function DataTableActionButton<K extends DataSourceKey>({
	dataSource,
	actionName,
	className,
	handleClick,
	disabled = false,
}: {
	dataSource: K;
	actionName: string;
	className?: string;
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
		<button
			type="button"
			className={className || 'btn'}
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
		</button>
	);
}
