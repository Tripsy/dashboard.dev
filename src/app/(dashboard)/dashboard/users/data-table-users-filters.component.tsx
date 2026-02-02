'use client';

import type React from 'react';
import { useCallback, useEffect, useMemo } from 'react';
import { useStore } from 'zustand/react';
import {
	FormFiltersDateRange,
	FormFiltersReset,
	FormFiltersSearch,
	FormFiltersSelect,
	FormFiltersShowDeleted,
} from '@/app/(dashboard)/_components/form-filters.component';
import { useDataTable } from '@/app/(dashboard)/_providers/data-table-provider';
import { UserRoleEnum, UserStatusEnum } from '@/entities/user.model';
import { createFilterHandlers } from '@/helpers/data-table.helper';
import { capitalizeFirstLetter } from '@/helpers/string.helper';
import { useSearchFilter, useTranslation } from '@/hooks';

const statuses = Object.values(UserStatusEnum).map((v) => ({
	label: capitalizeFirstLetter(v),
	value: v,
}));

const roles = Object.values(UserRoleEnum).map((v) => ({
	label: capitalizeFirstLetter(v),
	value: v,
}));

export const DataTableUsersFilters = (): React.JSX.Element => {
	const { stateDefault, modelStore } = useDataTable<'users'>();

	const translationsKeys = useMemo(
		() =>
			[
				'users.form_filters.label_global',
				'users.form_filters.label_status',
				'users.form_filters.label_role',
				'users.form_filters.label_create_date',
			] as const,
		[],
	);

	const { translations } = useTranslation(translationsKeys);

	const filters = useStore(modelStore, (state) => state.tableState.filters);
	const updateTableState = useStore(
		modelStore,
		(state) => state.updateTableState,
	);

	const updateFilters = useCallback(
		(newFilters: Partial<typeof DataTableUsersFilters>) => {
			updateTableState({
				filters: { ...filters, ...newFilters },
			});
		},
		[filters, updateTableState],
	);

	const handlers = useMemo(
		() => createFilterHandlers<'users'>(updateFilters),
		[updateFilters],
	);

	const {
		handleInputChange,
		handleSelectChange,
		handleCheckboxChange,
		handleDateChange,
	} = handlers;

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
				labelText={translations['users.form_filters.label_global']}
				fieldName="global"
				search={searchGlobal}
			/>

			<FormFiltersSelect
				labelText={translations['users.form_filters.label_status']}
				fieldName="status"
				fieldValue={filters.status.value}
				selectOptions={statuses}
				handleSelectChange={handleSelectChange}
			/>

			<FormFiltersSelect
				labelText={translations['users.form_filters.label_role']}
				fieldName="role"
				fieldValue={filters.role.value}
				selectOptions={roles}
				handleSelectChange={handleSelectChange}
			/>

			<FormFiltersDateRange
				labelText={translations['users.form_filters.label_create_date']}
				startDateField="create_date_start"
				startDateValue={filters.create_date_start?.value ?? ''}
				endDateField="create_date_end"
				endDateValue={filters.create_date_end?.value ?? ''}
				handleDateChange={handleDateChange}
			/>

			<FormFiltersShowDeleted
				is_deleted={filters.is_deleted?.value || false}
				handleCheckboxChange={handleCheckboxChange}
			/>

			<FormFiltersReset source="DataTableUsersFilters" />
		</div>
	);
};
