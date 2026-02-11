'use client';

import { type JSX, useCallback, useEffect, useMemo } from 'react';
import { useStore } from 'zustand/react';
import {
	createValueChangeHandler,
	FormFiltersReset,
	FormFiltersSearch,
	FormFiltersSelect,
	FormFiltersShowDeleted,
} from '@/app/(dashboard)/_components/form-filters.component';
import { useDataTable } from '@/app/(dashboard)/_providers/data-table-provider';
import type { UsersDataTableFiltersType } from '@/app/(dashboard)/dashboard/users/users.definition';
import { capitalizeFirstLetter } from '@/helpers/string.helper';
import { useSearchFilter } from '@/hooks/use-search-filter.hook';
import { useTranslation } from '@/hooks/use-translation.hook';
import {
	type UserModel,
	UserRoleEnum,
	UserStatusEnum,
} from '@/models/user.model';

const statuses = Object.values(UserStatusEnum).map((v) => ({
	label: capitalizeFirstLetter(v),
	value: v,
}));

const roles = Object.values(UserRoleEnum).map((v) => ({
	label: capitalizeFirstLetter(v),
	value: v,
}));

export const DataTableUsersFilters = (): JSX.Element => {
	const { stateDefault, dataTableStore } = useDataTable<'users', UserModel>();

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

	const filters = useStore(
		dataTableStore,
		(state) => state.tableState.filters,
	) as UsersDataTableFiltersType;

	const updateTableState = useStore(
		dataTableStore,
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

	console.log(filters);

	const onValueChange = useMemo(
		() =>
			createValueChangeHandler(filters, updateFilters, (prev, value) => ({
				...prev,
				value,
			})),
		[filters, updateFilters],
	);

	const searchGlobal = useSearchFilter({
		initialValue: filters.global?.value ?? '',
		debounceDelay: 1000,
		minLength: 3,
		onSearch: onValueChange('global'),
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
				search={searchGlobal}
			/>

			<FormFiltersSelect
				labelText={translations['users.form_filters.label_status']}
				fieldName="status"
				fieldValue={filters.status.value}
				options={statuses}
				onValueChange={(value) =>
					onValueChange('status')(value as UserStatusEnum)
				}
			/>

			<FormFiltersSelect
				labelText={translations['users.form_filters.label_role']}
				fieldName="role"
				fieldValue={filters.role.value}
				options={roles}
				onValueChange={(value) =>
					onValueChange('role')(value as UserRoleEnum)
				}
			/>

			{/*<FormFiltersDateRange*/}
			{/*	labelText={translations['users.form_filters.label_create_date']}*/}
			{/*	startDateField="create_date_start"*/}
			{/*	startDateValue={filters.create_date_start?.value ?? ''}*/}
			{/*	endDateField="create_date_end"*/}
			{/*	endDateValue={filters.create_date_end?.value ?? ''}*/}
			{/*	handleDateChange={handleDateChange}*/}
			{/*/>*/}

			<FormFiltersShowDeleted
				checked={filters.is_deleted?.value || false}
				onCheckedChange={(value) => onValueChange('is_deleted')(value)}
			/>

			<FormFiltersReset source="DataTableUsersFilters" />
		</div>
	);
};
