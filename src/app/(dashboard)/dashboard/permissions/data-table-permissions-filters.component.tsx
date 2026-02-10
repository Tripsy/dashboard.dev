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
import { createFilterHandlers } from '@/helpers/data-table.helper';
import { useSearchFilter } from '@/hooks/use-search-filter.hook';
import { useTranslation } from '@/hooks/use-translation.hook';
import type { PermissionModel } from '@/models/permission.model';

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

	const updateFilters = useCallback(
		(newFilters: Partial<typeof DataTablePermissionsFilters>) => {
			updateTableState({
				filters: { ...filters, ...newFilters },
			});
		},
		[filters, updateTableState],
	);

	const handlers = useMemo(
		() => createFilterHandlers(updateFilters),
		[updateFilters],
	);
	const { handleInputChange, handleCheckboxChange } = handlers;

	const searchGlobal = useSearchFilter({
		initialValue: filters.global?.value ?? '',
		debounceDelay: 1000,
		minLength: 3,
		onSearch: (value) => {
			handleInputChange('global', value);
		},
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
			<FormFiltersSearch
				labelText={
					translations['permissions.form_filters.label_global']
				}
				fieldName="global"
				search={searchGlobal}
			/>

			<FormFiltersShowDeleted
				is_deleted={filters.is_deleted?.value || false}
				handleCheckboxChange={handleCheckboxChange}
			/>

			<FormFiltersReset source="DataTablePermissionsFilters" />
		</div>
	);
};
