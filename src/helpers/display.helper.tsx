import clsx from 'clsx';
import { type ComponentType, type JSX, useMemo } from 'react';
import { Icons } from '@/components/icon.component';
import { Badge, type BadgeVariant } from '@/components/ui/badge';
import { formatAmount } from '@/helpers/string.helper';
import { useTranslation } from '@/hooks/use-translation.hook';

export const statusList: Record<
	string,
	{ variant: BadgeVariant; icon: ComponentType<{ className?: string }> }
> = {
	active: {
		variant: 'success',
		icon: Icons.Status.Active,
	},
	pending: {
		variant: 'warning',
		icon: Icons.Status.Pending,
	},
	inactive: {
		variant: 'error',
		icon: Icons.Status.Inactive,
	},
	deleted: {
		variant: 'default',
		icon: Icons.Status.Deleted,
	},
	ok: {
		variant: 'success',
		icon: Icons.Status.Ok,
	},
	error: {
		variant: 'error',
		icon: Icons.Status.Error,
	},
	warning: {
		variant: 'warning',
		icon: Icons.Status.Warning,
	},
	sent: {
		variant: 'success',
		icon: Icons.Status.Sent,
	},
};

export const DisplayStatus = ({
	status,
}: {
	status: keyof typeof statusList;
}) => {
	const translationsKeys = useMemo(
		() => [`app.status.${status}`] as const,
		[status],
	);

	const { translations } = useTranslation(translationsKeys);

	const { variant, icon: Icon } = statusList[status] || {};

	// When status props are not defined
	if (!variant || !Icon) {
		return <Badge variant="default">{status}</Badge>;
	}

	return (
		<Badge
			variant={variant}
			size="status"
			className="min-w-28 opacity-70 hover:opacity-100"
		>
			<Icon className="w-4 h-4" />
			{translations[`app.status.${status}`]}
		</Badge>
	);
};

export const DisplayDeleted = ({
	value,
	isDeleted,
}: {
	value: string | JSX.Element;
	isDeleted: boolean;
}) => {
	return <div className={clsx(isDeleted && 'line-through')}>{value}</div>;
};

export function DisplayAmount({
	cents,
	currencyCode,
	sign,
}: {
	cents: number;
	currencyCode: string;
	sign: 1 | -1;
}) {
	const formatted = formatAmount(cents, currencyCode, sign);

	return (
		<span style={{ color: formatted.sign === '-' ? 'red' : 'inherit' }}>
			{formatted.sign} {formatted.value} {formatted.currency}
		</span>
	);
}
