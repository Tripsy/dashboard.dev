'use client';

import { useMemo } from 'react';
import { useStore } from 'zustand/react';
import { DataTableActionButton } from '@/app/(dashboard)/_components/data-table-action-button.component';
import { useDataTable } from '@/app/(dashboard)/_providers/data-table-provider';
import { Loading } from '@/components/loading.component';
import {
	type DataSourceModel,
	type DataSourceType,
	getDataSourceConfig,
} from '@/config/data-source';
import { ApiError } from '@/exceptions/api.error';
import ValueError from '@/exceptions/value.error';
import { replaceVars } from '@/helpers/string.helper';
import { useTranslation } from '@/hooks';
import { useToast } from '@/providers/toast.provider';

function displayActionEntries<K extends keyof DataSourceType>(
	dataSource: K,
	entries: DataSourceModel<K>[],
) {
	const functions = getDataSourceConfig(dataSource, 'functions');

	if (!functions) {
		throw new ValueError(`'functions' are not defined for ${dataSource}`);
	}

	const displayActionEntries = functions.displayActionEntries;

	if (!displayActionEntries) {
		throw new ValueError(
			`'displayActionEntries' function is not defined for ${dataSource}`,
		);
	}

	return displayActionEntries(entries);
}

export function ActionManage() {
	const { dataSource, dataTableStore } = useDataTable();
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
		return <Loading text={translations['app.text.loading']} />;
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
			// When allowedEntries is 'single', actionEntry is used, otherwise selectedEntries is used to map through entries
			const ids = (
				actionProps.allowedEntries === 'single'
					? [actionEntry as DataSourceModel<typeof dataSource>]
					: selectedEntries
			).map((entry) => entry.id);

			const fetchResponse = await executeFetch(ids);

			refreshTableState();

			showToast({
				severity: fetchResponse?.success ? 'success' : 'error',
				summary: fetchResponse?.success ? 'Success' : 'Error',
				detail: fetchResponse?.message || translations['error.form'],
			});
		} catch (error: unknown) {
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
			? [actionEntry as DataSourceModel<typeof dataSource>]
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
