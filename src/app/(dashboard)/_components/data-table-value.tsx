'use client';

import clsx from 'clsx';
import { type ComponentType, type JSX, useMemo } from 'react';
import { Icons } from '@/components/icon.component';
import { Badge, type BadgeVariant } from '@/components/ui/badge';
import { formatDate } from '@/helpers/date.helper';
import { capitalizeFirstLetter } from '@/helpers/string.helper';
import { useTranslation } from '@/hooks/use-translation.hook';

export type DataTableColumnType<Model> = {
	field: string;
	header: string;
	sortable?: boolean;
	body?: (
		entry: Model,
		column: DataTableColumnType<Model>,
	) => JSX.Element | string;
	style?: React.CSSProperties;
};

type DataTableValueOptionsType<Model> = {
	customValue?: string;
	capitalize?: boolean;
	markDeleted?: boolean;
	isStatus?: boolean;
	displayDate?: boolean;
	source?: string;
	action?: {
		name: null | string | ((entry: Model) => string | null);
		source: string;
	};
};

const statusList: Record<
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

export const DisplayDeleted = ({
	value,
	isDeleted,
}: {
	value: string | JSX.Element;
	isDeleted: boolean;
}) => {
	return <div className={clsx(isDeleted && 'line-through')}>{value}</div>;
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

export const DisplayAction = <Model extends Record<string, unknown>>({
	value,
	action,
	entry,
}: {
	value: string | JSX.Element;
	action: NonNullable<DataTableValueOptionsType<Model>['action']>;
	entry: Model;
}) => {
	const actionName =
		typeof action.name === 'function' ? action.name(entry) : action.name;

	const actionTitleKey = `${action.source}.action.${actionName}.title`;

	const translationsKeys = useMemo(
		() => [actionTitleKey] as const,
		[actionTitleKey],
	);

	const { translations } = useTranslation(translationsKeys);

	if (!actionName) {
		return value;
	}

	const triggerAction = () => {
		const event = new CustomEvent('useDataTableAction', {
			detail: {
				source: action.source,
				actionName: actionName,
				entry,
			},
		});

		window.dispatchEvent(event);
	};

	return (
		<button
			type="button"
			onClick={triggerAction}
			title={translations[actionTitleKey]}
			className="cursor-pointer hover:underline"
		>
			{value}
		</button>
	);
};

export const DataTableValue = <Model extends Record<string, unknown>>(
	entry: Model,
	column: DataTableColumnType<Model>,
	options: DataTableValueOptionsType<Model>,
) => {
	let outputValue: string | JSX.Element;

	if (options.customValue) {
		outputValue = options.customValue;
	} else {
		const entryValue: string | object = entry[column.field] as
			| string
			| object;

		if (entryValue == null) {
			return '-';
		}

		if (typeof entryValue === 'object') {
			outputValue = Object.values(entryValue).join(', ');
		} else {
			outputValue = entryValue;
		}
	}

	if (options.capitalize) {
		outputValue = capitalizeFirstLetter(outputValue);
	}

	if (options.displayDate) {
		outputValue = formatDate(outputValue, 'date-time') || '-';
	}

	if (options.isStatus && column.field === 'status' && 'status' in entry) {
		const status =
			options.markDeleted && 'deleted_at' in entry && entry?.deleted_at
				? 'deleted'
				: (entry.status as keyof typeof statusList);

		outputValue = <DisplayStatus status={status} />;
	} else if (options.markDeleted && 'deleted_at' in entry) {
		outputValue = (
			<DisplayDeleted
				value={outputValue}
				isDeleted={!!entry?.deleted_at}
			/>
		);
	}

	if (options.action) {
		outputValue = (
			<DisplayAction
				value={outputValue}
				action={options.action}
				entry={entry}
			/>
		);
	}

	return outputValue;
};
