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
import type { CmrSessionModel } from '@/models/cmr-session.model';
import { displayWorkSessionLabel } from '@/models/work-session.model';
import type { DataSourceKey } from '@/types/data-source.key';

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
	ordered: {
		variant: 'default',
		icon: Icons.Status.Ordered,
	},
	preparing: {
		variant: 'info',
		icon: Icons.Status.Preparing,
	},
	transit: {
		variant: 'info',
		icon: Icons.Status.Transit,
	},
	delivered: {
		variant: 'success',
		icon: Icons.Status.Delivered,
	},
	delayed: {
		variant: 'warning',
		icon: Icons.Status.Delayed,
	},
};

export const DisplayStatus = ({
	status,
	dataSource,
	variant,
	size,
	icon: Icon,
}: {
	status: keyof typeof statusList;
	dataSource: DataSourceKey;
	variant?: BadgeVariant;
	size?: BadgeSize;
	icon?: ComponentType<{ className?: string }>;
}) => {
	const translationsKeys = useMemo(
		() => [`${dataSource}.status.${status}`] as const,
		[dataSource, status],
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
			{translations[`${dataSource}.status.${status}`] || status}
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

/**
 * Displays a formatted amount with optional VAT calculation and conditional styling for negative values
 *
 * @param {Object} props - Component props
 * @param {number} props.amount
 * @param {string} props.currencyCode - Currency code (e.g., RON, USD, EUR)
 * @returns {JSX.Element} Formatted amount span with currency and conditional styling
 *
 * @example
 * // Display positive amount in RON
 * <DisplayAmount netAmount={100} currencyCode="RON" sign={1} />
 *
 * @example
 * // Display negative amount with error styling
 * <DisplayAmount netAmount={50} currencyCode="EUR" sign={-1} vat_rate={20} />
 */
export function DisplayAmount({
	amount,
	currencyCode,
	classNameNegative = 'text-error dark:text-warning',
	classNamePositive,
}: {
	amount: number;
	currencyCode: string;
	classNameNegative?: string;
	classNamePositive?: string;
}): JSX.Element {
	const formatted = formatAmount(amount, currencyCode);

	return (
		<span className={amount < 0 ? classNameNegative : classNamePositive}>
			{formatted.value} {formatted.currency}
		</span>
	);
}

export function displayColumnSession(cmr_sessions: CmrSessionModel[]) {
	const lastSession = cmr_sessions.reduce(
		(max, entry) => (entry.id > max.id ? entry : max),
		cmr_sessions[0],
	);

	if (!lastSession) {
		return '-';
	}

	return (
		<div className="flex items-center gap-2">
			<DisplayStatus
				status={lastSession.work_session.status}
				dataSource="work-session"
			/>
			{displayWorkSessionLabel(lastSession.work_session)}
		</div>
	);
}
