'use client';

import { type JSX, useCallback, useEffect } from 'react';
import { useStore } from 'zustand/react';
import {
	FormFiltersReset,
	FormFiltersSearch,
	FormFiltersSelect,
} from '@/app/(dashboard)/_components/form-filters.component';
import { useDataTable } from '@/app/(dashboard)/_providers/data-table-provider';
import type { BrandsDataTableFiltersType } from '@/app/(dashboard)/dashboard/brands/brands.definition';
import { capitalizeFirstLetter } from '@/helpers/string.helper';
import { useSearchFilter } from '@/hooks/use-search-filter.hook';
import {
	type BrandModel,
	BrandStatusEnum,
	BrandTypeEnum,
} from '@/models/brand.model';

const statuses = Object.values(BrandStatusEnum).map((v) => ({
	label: capitalizeFirstLetter(v),
	value: v,
}));

const types = Object.values(BrandTypeEnum).map((v) => ({
	label: capitalizeFirstLetter(v),
	value: v,
}));

export const DataTableBrandsFilters = (): JSX.Element => {
	const { stateDefault, dataTableStore } = useDataTable<
		'brands',
		BrandModel
	>();

	const filters = useStore(
		dataTableStore,
		(state) => state.tableState.filters,
	) as BrandsDataTableFiltersType;

	const updateTableState = useStore(
		dataTableStore,
		(state) => state.updateTableState,
	);

	const setFilterValue = useCallback(
		<K extends keyof BrandsDataTableFiltersType>(
			key: K,
			value: BrandsDataTableFiltersType[K]['value'],
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
			<FormFiltersSearch<BrandsDataTableFiltersType>
				labelText="ID / Name / Description"
				search={searchGlobal}
			/>

			<FormFiltersSelect<BrandsDataTableFiltersType>
				labelText="Status"
				fieldName="status"
				fieldValue={filters.status.value}
				options={statuses}
				onValueChange={(value) =>
					setFilterValue('status', value as BrandStatusEnum)
				}
			/>

			<FormFiltersSelect<BrandsDataTableFiltersType>
				labelText="Type"
				fieldName="type"
				fieldValue={filters.type.value}
				options={types}
				onValueChange={(value) =>
					setFilterValue('type', value as BrandTypeEnum)
				}
			/>

			<FormFiltersReset dataSource="brands" />
		</div>
	);
};
