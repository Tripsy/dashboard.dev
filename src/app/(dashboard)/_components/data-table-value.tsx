'use client';

import clsx from 'clsx';
import { type JSX, useMemo } from 'react';
import { Icons } from '@/components/icon.component';
import type {
	DataSourceModel,
	DataSourceType,
	DataTableColumnType,
} from '@/config/data-source';
import { formatDate } from '@/helpers/date.helper';
import { capitalizeFirstLetter } from '@/helpers/string.helper';
import { useTranslation } from '@/hooks';

export const statusList = {
	active: {
		class: 'badge badge-success h-8',
		icon: <Icons.Status.Active />,
	},
	pending: {
		class: 'badge badge-warning h-8',
		icon: <Icons.Status.Pending />,
	},
	inactive: {
		class: 'badge badge-error h-8',
		icon: <Icons.Status.Inactive />,
	},
	deleted: {
		class: 'badge badge-neutral h-8',
		icon: <Icons.Status.Deleted />,
	},
	ok: {
		class: 'badge badge-success h-8',
		icon: <Icons.Status.Ok />,
	},
	error: {
		class: 'badge badge-error h-8',
		icon: <Icons.Status.Error />,
	},
	warning: {
		class: 'badge badge-warning h-8',
		icon: <Icons.Status.Warning />,
	},
	sent: {
		class: 'badge badge-success h-8',
		icon: <Icons.Status.Sent />,
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

export const DisplayStatus = ({ status }: { status: string }) => {
	const statusProps = statusList[status as keyof typeof statusList];

	const translationsKeys = useMemo(
		() => [`app.status.${status}`] as const,
		[status],
	);

	const { translations } = useTranslation(translationsKeys);

	return (
		<div
			className={`${statusProps.class} w-full text-white dark:text-black opacity-70 hover:opacity-100`}
		>
			{statusProps.icon}
			{translations[`app.status.${status}`]}
		</div>
	);
};

export const DisplayAction = <K extends keyof DataSourceType>({
	value,
	action,
	entry,
}: {
	value: string | JSX.Element;
	action: NonNullable<DataTableValueOptionsType<K>['action']>;
	entry: DataSourceModel<K>;
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

export type DataTableValueOptionsType<K extends keyof DataSourceType> = {
	customValue?: string;
	capitalize?: boolean;
	markDeleted?: boolean;
	isStatus?: boolean;
	displayDate?: boolean;
	source?: string;
	action?: {
		name: null | string | ((entry: DataSourceModel<K>) => string | null);
		source: string;
	};
};

export const DataTableValue = <K extends keyof DataSourceType>(
	entry: DataSourceModel<K> & Record<string, unknown>,
	column: DataTableColumnType<DataSourceModel<K>>,
	options: DataTableValueOptionsType<K>,
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
