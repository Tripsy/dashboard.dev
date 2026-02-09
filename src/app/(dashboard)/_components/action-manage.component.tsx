'use client';

import { useMemo } from 'react';
import { useStore } from 'zustand/react';
import { DataTableActionButton } from '@/app/(dashboard)/_components/data-table-action-button.component';
import { useDataTable } from '@/app/(dashboard)/_providers/data-table-provider';
import { LoadingComponent } from '@/components/status.component';
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

export function ActionManage<
	K extends DataSourceKey,
	Model extends BaseModelType,
>() {
	const { dataSource, dataTableStore } = useDataTable<K, Model>();
	const { showToast } = useToast();

	const isOpen = useStore(dataTableStore, (state) => state.isOpen);
	const actionName = useStore(
		dataTableStore,
		(state) => state.actionName,
	) as string;
	const actionEntry = useStore(dataTableStore, (state) => state.actionEntry);
	const closeOut = useStore(dataTableStore, (state) => state.closeOut);
	const isLoading = useStore(dataTableStore, (state) => state.isLoading);
	const setLoading = useStore(dataTableStore, (state) => state.setLoading);
	const refreshTableState = useStore(
		dataTableStore,
		(state) => state.refreshTableState,
	);
	const selectedEntries = useStore(
		dataTableStore,
		(state) => state.selectedEntries,
	);

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

	if (!isOpen || !actionName) {
		return null;
	}

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
			`'actionProps' action props are not defined for '${actionName}'`,
		);
	}

	if (actionProps.allowedEntries === 'single' && !actionEntry) {
		throw new ValueError(`'actionEntry' was not provided`);
	}

	async function executeFetch(ids: number[]) {
		const actionFunction = actionProps.function;

		if (!actionFunction || typeof actionFunction !== 'function') {
			throw new ValueError(`Function is not defined for ${actionName}`);
		}

		return actionFunction(ids);
	}

	const handleClose = () => {
		closeOut();
	};

	const handleAction = async () => {
		setLoading(true);

		try {
			// When allowedEntries is 'single', actionEntry is used; otherwise selectedEntries is used to map through entries
			const ids: number[] = (
				actionProps.allowedEntries === 'single'
					? actionEntry
						? [actionEntry]
						: []
					: selectedEntries
			).map((entry) => entry.id);

			const fetchResponse = await executeFetch(ids);

			refreshTableState();

			showToast({
				severity: fetchResponse?.success ? 'success' : 'error',
				summary: fetchResponse?.success ? 'Success' : 'Error',
				detail: fetchResponse?.message || translations['error.form'],
			});
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
		closeOut();
	};

	const actionContentEntries = displayActionEntries(
		dataSource,
		actionProps.allowedEntries === 'single'
			? [actionEntry]
			: selectedEntries,
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
				<button
					type="button"
					onClick={handleClose}
					title="Cancel"
					className="btn btn-action-cancel"
					disabled={isLoading}
				>
					Cancel
				</button>
				<DataTableActionButton
					key={`button-modal-${actionName}`}
					dataSource={dataSource}
					actionName={actionName}
					className={actionProps.button?.className}
					handleClick={handleAction}
					disabled={isLoading}
				/>
			</div>
		</>
	);
}
