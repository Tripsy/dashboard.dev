'use client';

import { type JSX, useCallback, useEffect, useMemo } from 'react';
import { useStore } from 'zustand/react';
import {
	FormFiltersDateRange,
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

	const setFilterValue = useCallback(
		<K extends keyof UsersDataTableFiltersType>(
			key: K,
			value: UsersDataTableFiltersType[K]['value'],
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
			<FormFiltersSearch<UsersDataTableFiltersType>
				labelText={translations['users.form_filters.label_global']}
				search={searchGlobal}
			/>

			<FormFiltersSelect<UsersDataTableFiltersType>
				labelText={translations['users.form_filters.label_status']}
				fieldName="status"
				fieldValue={filters.status.value}
				options={statuses}
				onValueChange={(value) =>
					setFilterValue('status', value as UserStatusEnum)
				}
			/>

			<FormFiltersSelect<UsersDataTableFiltersType>
				labelText={translations['users.form_filters.label_role']}
				fieldName="role"
				fieldValue={filters.role.value}
				options={roles}
				onValueChange={(value) =>
					setFilterValue('role', value as UserRoleEnum)
				}
			/>

			<FormFiltersDateRange<UsersDataTableFiltersType>
				labelText={translations['users.form_filters.label_create_date']}
				start={{
					fieldName: 'create_date_start',
					fieldValue: filters.create_date_start.value,
					onSelect: (value) =>
						setFilterValue('create_date_start', value),
				}}
				end={{
					fieldName: 'create_date_end',
					fieldValue: filters.create_date_end.value,
					onSelect: (value) =>
						setFilterValue('create_date_end', value),
				}}
			/>

			<FormFiltersShowDeleted
				checked={filters.is_deleted?.value || false}
				onCheckedChange={(value) => setFilterValue('is_deleted', value)}
			/>

			<FormFiltersReset source="DataTableUsersFilters" />
		</div>
	);
};
