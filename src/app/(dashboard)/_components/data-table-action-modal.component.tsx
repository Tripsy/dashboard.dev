'use client';

import React, {useMemo, useState} from 'react';
import { DataTableActionButton } from '@/app/(dashboard)/_components/data-table-action-button.component';
import { Icons } from '@/components/icon.component';
import { LoadingComponent } from '@/components/status.component';
import { Button } from '@/components/ui/button';
import {
	type BaseModelType,
	type DataSourceKey,
	type DisplayActionEntriesFunctionType,
	getDataSourceConfig,
} from '@/config/data-source.config';
import { ApiError } from '@/exceptions/api.error';
import ValueError from '@/exceptions/value.error';
import { replaceVars } from '@/helpers/string.helper';
import { useTranslation } from '@/hooks/use-translation.hook';
import { useToast } from '@/providers/toast.provider';
import type {ModalOnSuccess} from "@/app/(dashboard)/_stores/modal.store";

function displayActionEntries<K extends DataSourceKey, Model>(
	dataSource: K,
	entries: Model[],
) {
	const functions = getDataSourceConfig(dataSource, 'functions');

	if (
		!('displayActionEntries' in functions) ||
		typeof functions.displayActionEntries !== 'function'
	) {
		throw new ValueError(
			`'displayActionEntries' function is not defined for ${dataSource}`,
		);
	}

	return (
		functions.displayActionEntries as DisplayActionEntriesFunctionType<Model>
	)(entries);
}

export function DataTableActionModal<K extends DataSourceKey>({
	dataSource,
	actionName,
	actionEntries,
	onSuccessAction,
	onCloseAction
}: {
	dataSource: K;
	actionName: string;
	actionEntries: BaseModelType[];
	onSuccessAction?: ModalOnSuccess;
	onCloseAction: () => void;
}) {
	const [loading, setLoading] = useState(false);
	const { showToast } = useToast();

	const confirmTextKey = `${dataSource}.action.${actionName}.confirmText`;

	const translationsKeys = useMemo(
		() =>
			[
				confirmTextKey,
				'app.error.form',
				'app.text.loading',
				'dashboard.text.selected_entries_one',
				'dashboard.text.selected_entries_many',
			] as const,
		[confirmTextKey],
	);

	const { translations, isTranslationLoading } =
		useTranslation(translationsKeys);

	if (isTranslationLoading) {
		return (
			<LoadingComponent description={translations['app.text.loading']} />
		);
	}

	const actions = getDataSourceConfig(dataSource, 'actions');

	if (!actions) {
		throw new ValueError(`'actions are not defined for ${dataSource}`);
	}

	const actionProps = actions[actionName];

	if (!actionProps) {
		throw new ValueError(
			`'actionProps' action props are not defined for '${actionName}' (hint: manage)`,
		);
	}

	if (actionProps.allowedEntries === 'single' && actionEntries.length > 1) {
		throw new ValueError(`Multiple entries provided for single action`);
	}

	async function executeFetch(ids: number[]) {
		const actionFunction = actionProps.function;

		if (!actionFunction || typeof actionFunction !== 'function') {
			throw new ValueError(`Function is not defined for ${actionName}`);
		}

		return actionFunction(ids);
	}

	const handleAction = async () => {
		setLoading(true);

		try {
			const ids: number[] = actionEntries.map((entry) => entry.id);

			const fetchResponse = await executeFetch(ids);

			if (onSuccessAction) {
				onSuccessAction(actionName);
			} else {
				refreshTableState();

				showToast({
					severity: fetchResponse?.success ? 'success' : 'error',
					summary: fetchResponse?.success ? 'Success' : 'Error',
					detail: fetchResponse?.message || translations['error.form'],
				});
			}
		} catch (error) {
			showToast({
				severity: 'error',
				summary: 'Error',
				detail:
					error instanceof ValueError || error instanceof ApiError
						? error.message
						: translations['error.form'],
			});
		}

		setLoading(false);
		onCloseAction();
	};

	const actionContentEntries = displayActionEntries(
		dataSource,
		actionEntries
	);

	return (
		<>
			<p className="pb-4 font-semibold">
				{replaceVars(
					actionContentEntries.length === 1
						? translations['dashboard.text.selected_entries_one']
						: translations['dashboard.text.selected_entries_many'],
					{
						count: actionContentEntries.length.toString(),
					},
				)}
			</p>
			<ul className="pb-4 italic list-disc ml-4">
				{actionContentEntries.map((entry) => (
					<li key={`action-entry-${entry.id}`}>
						{entry.label}{' '}
						<span className="text-md">({`#${entry.id}`})</span>
					</li>
				))}
			</ul>
			<p className="pb-4 font-semibold">
				{translations[confirmTextKey] ||
					`Are you sure you want to ${actionName.toLowerCase()} these entries?`}
			</p>

			<div className="flex justify-end gap-3">
				<Button
					variant="outline"
					hover="warning"
					onClick={onCloseAction}
					title="Cancel"
					disabled={loading}
				>
					<Icons.Action.Cancel />
					Cancel
				</Button>
				{/*TODO enhance loading*/}
				<DataTableActionButton
					key={`button-modal-${actionName}`}
					dataSource={dataSource}
					actionName={actionName}
					buttonProps={actionProps.buttonProps}
					handleClick={handleAction}
					disabled={loading}
				/>
			</div>
		</>
	);
}
