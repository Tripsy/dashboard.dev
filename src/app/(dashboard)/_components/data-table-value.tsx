'use client';

import type { JSX } from 'react';
import { dispatchDataTableAction } from '@/app/(dashboard)/_events/data-table-action.event';
import type {
	DataSourceKey,
	DataTableColumnType,
	DataTableValueOptionsType,
} from '@/config/data-source.config';
import { formatDate } from '@/helpers/date.helper';
import {
	DisplayDeleted,
	DisplayStatus,
	type statusList,
} from '@/helpers/display.helper';
import { getErrorMessage } from '@/helpers/objects.helper';
import { requestView } from '@/helpers/services.helper';
import { capitalizeFirstLetter } from '@/helpers/string.helper';
import { useToast } from '@/providers/toast.provider';
import type { ActionButtonPropsType } from '@/types/html.type';

export const DisplayButton = <Entry,>({
	buttonProps,
	action,
	dataSource,
	entryOrId,
}: {
	buttonProps: ActionButtonPropsType;
	action: string;
	dataSource: DataSourceKey;
	entryOrId: Entry | number;
}) => {
	const { showToast } = useToast();

	return (
		<button
			type="button"
			className="cursor-pointer hover:underline"
			onClick={async () => {
				try {
					const entry =
						typeof entryOrId === 'number'
							? await requestView<Entry>(dataSource, entryOrId)
							: entryOrId;

					dispatchDataTableAction({
						dataSource,
						action,
						entries: [entry],
					});
				} catch (error) {
					showToast({
						severity: 'error',
						summary: `Failed to resolve entry for action "${action}"`,
						detail: getErrorMessage(error),
					});
				}
			}}
			title={buttonProps.title}
		>
			{buttonProps.label}
		</button>
	);
};

export const DataTableValue = <Entry extends Record<string, unknown>>(
	entry: Entry,
	column: DataTableColumnType<Entry>,
	options: DataTableValueOptionsType<Entry>,
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

	if (options.capitalize && typeof outputValue === 'string') {
		outputValue = capitalizeFirstLetter(outputValue);
	}

	if (options.displayDate && typeof outputValue === 'string') {
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

	if (options.displayButton) {
		const { action, dataSource } = options.displayButton;

		const resolvedAction =
			typeof action === 'function' ? action(entry) : action;

		if (resolvedAction) {
			outputValue = (
				<DisplayButton
					buttonProps={{
						label: outputValue,
						title: options.displayButton.altTitle,
					}}
					action={resolvedAction}
					dataSource={dataSource}
					entryOrId={options.displayButton.alternateEntryId ?? entry}
				/>
			);
		}
	}

	return outputValue;
};
