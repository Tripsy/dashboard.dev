import clsx from 'clsx';
import { type ComponentType, type JSX, useMemo } from 'react';
import { Icons } from '@/components/icon.component';
import {
	Badge,
	type BadgeSize,
	type BadgeVariant,
} from '@/components/ui/badge';
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
	authorized: {
		variant: 'success',
		icon: Icons.Status.Authorized,
	},
	completed: {
		variant: 'success',
		icon: Icons.Status.Ok,
	},
	failed: {
		variant: 'error',
		icon: Icons.Status.Failed,
	},
	canceled: {
		variant: 'warning',
		icon: Icons.Status.Canceled,
	},
	expired: {
		variant: 'warning',
		icon: Icons.Status.Expired,
	},
	requires_action: {
		variant: 'info',
		icon: Icons.Status.RequiresAction,
	},
	verified: {
		variant: 'success',
		icon: Icons.Status.Verified,
	},
	draft: {
		variant: 'warning',
		icon: Icons.Status.Draft,
	},
	in_use: {
		variant: 'success',
		icon: Icons.Status.InUse,
	},
	damaged: {
		variant: 'error',
		icon: Icons.Status.Damaged,
	},
	sold: {
		variant: 'info',
		icon: Icons.Status.Sold,
	},
	scrapped: {
		variant: 'warning',
		icon: Icons.Status.Scrapped,
	},
	closed: {
		variant: 'error',
		icon: Icons.Status.Closed,
	},
	assigned: {
		variant: 'info',
		icon: Icons.Status.Assigned,
	},
	returned: {
		variant: 'warning',
		icon: Icons.Status.Returned,
	},
};

export const DisplayStatus = ({
	status,
	variant,
	size,
	icon: Icon,
}: {
	status: keyof typeof statusList;
	variant?: BadgeVariant;
	size?: BadgeSize;
	icon?: ComponentType<{ className?: string }>;
}) => {
	const translationsKeys = useMemo(
		() => [`app.status.${status}`] as const,
		[status],
	);

	const { translations } = useTranslation(translationsKeys);
	const { variant: statusVariant, icon: StatusIcon } =
		statusList[status] || {};

	const computedVariant = variant || statusVariant || 'default';
	const computedSize = size || 'status';
	const ComputedIcon = Icon || StatusIcon;

	return (
		<Badge
			variant={computedVariant}
			size={computedSize}
			className="min-w-28 opacity-70 hover:opacity-100"
		>
			{ComputedIcon && <ComputedIcon className="w-4 h-4" />}
			{translations[`app.status.${status}`] || status}
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
	amount,
	currencyCode,
	sign,
}: {
	amount: number;
	currencyCode: string;
	sign: 1 | -1;
}) {
	const formatted = formatAmount(amount, currencyCode);

	return (
		<span className={sign === -1 ? 'text-error dark:text-warning' : ''}>
			{formatted.value} {formatted.currency}
		</span>
	);
}
