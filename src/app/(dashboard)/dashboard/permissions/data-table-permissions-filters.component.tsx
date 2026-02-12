'use client';

import { type JSX, useCallback, useEffect, useMemo } from 'react';
import { useStore } from 'zustand/react';
import {
	FormFiltersReset,
	FormFiltersSearch,
	FormFiltersShowDeleted,
} from '@/app/(dashboard)/_components/form-filters.component';
import { useDataTable } from '@/app/(dashboard)/_providers/data-table-provider';
import type { PermissionDataTableFiltersType } from '@/app/(dashboard)/dashboard/permissions/permissions.definition';
import { useSearchFilter } from '@/hooks/use-search-filter.hook';
import { useTranslation } from '@/hooks/use-translation.hook';
import type { PermissionModel } from '@/models/permission.model';
import type {UsersDataTableFiltersType} from "@/app/(dashboard)/dashboard/users/users.definition";

export const DataTablePermissionsFilters = (): JSX.Element => {
	const { stateDefault, dataTableStore } = useDataTable<
		'permissions',
		PermissionModel
	>();

	const translationsKeys = useMemo(
		() => ['permissions.form_filters.label_global'] as const,
		[],
	);

	const { translations } = useTranslation(translationsKeys);

	const filters = useStore(
		dataTableStore,
		(state) => state.tableState.filters,
	) as PermissionDataTableFiltersType;

	const updateTableState = useStore(
		dataTableStore,
		(state) => state.updateTableState,
	);

	const setFilterValue = useCallback(
		<K extends keyof PermissionDataTableFiltersType>(
			key: K,
			value: PermissionDataTableFiltersType[K]['value'],
		) => {
			updateTableState({
				filters: {
					...filters,
					[key]: {
						...filters[key],
						value,
					},
				},
			});
		},
		[filters, updateTableState],
	);


	const searchGlobal = useSearchFilter({
		initialValue: filters.global?.value ?? '',
		debounceDelay: 1000,
		minLength: 3,
		onSearch: (value) => setFilterValue('global', value),
	});

	useEffect(() => {
		const handleFilterReset = () => {
			updateTableState({
				filters: stateDefault.filters,
			});

			searchGlobal.onReset();
		};

		window.addEventListener(
			'filterReset',
			handleFilterReset as EventListener,
		);

		return () => {
			window.removeEventListener(
				'filterReset',
				handleFilterReset as EventListener,
			);
		};
	}, [searchGlobal, stateDefault.filters, updateTableState]);

	return (
		<div className="form-section flex-row flex-wrap gap-4 border-b border-line pb-4">
			<FormFiltersSearch<PermissionDataTableFiltersType>
				labelText={translations['permissions.form_filters.label_global']}
				search={searchGlobal}
			/>

			<FormFiltersShowDeleted
				checked={filters.is_deleted?.value || false}
				onCheckedChange={(value) => setFilterValue('is_deleted', value)}
			/>

			<FormFiltersReset source="DataTablePermissionsFilters" />
		</div>
	);
};
