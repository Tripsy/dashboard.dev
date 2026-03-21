'use client';

import { type JSX, useCallback, useEffect } from 'react';
import { useStore } from 'zustand/react';
import {
	FormFiltersReset,
	FormFiltersSearch,
	FormFiltersSelect,
} from '@/app/(dashboard)/_components/form-filters.component';
import { useDataTable } from '@/app/(dashboard)/_providers/data-table-provider';
import type { PlacesDataTableFiltersType } from '@/app/(dashboard)/dashboard/places/places.definition';
import { capitalizeFirstLetter } from '@/helpers/string.helper';
import { useSearchFilter } from '@/hooks/use-search-filter.hook';
import { type PlaceModel, PlaceTypeEnum } from '@/models/place.model';

const placeTypes = Object.values(PlaceTypeEnum).map((v) => ({
	label: capitalizeFirstLetter(v),
	value: v,
}));

export const DataTablePlacesFilters = (): JSX.Element => {
	const { stateDefault, dataTableStore } = useDataTable<
		'places',
		PlaceModel
	>();

	const filters = useStore(
		dataTableStore,
		(state) => state.tableState.filters,
	) as PlacesDataTableFiltersType;

	const updateTableState = useStore(
		dataTableStore,
		(state) => state.updateTableState,
	);

	const setFilterValue = useCallback(
		<K extends keyof PlacesDataTableFiltersType>(
			key: K,
			value: PlacesDataTableFiltersType[K]['value'],
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
			<FormFiltersSearch<PlacesDataTableFiltersType>
				labelText="ID / Name"
				search={searchGlobal}
			/>

			<FormFiltersSelect<PlacesDataTableFiltersType>
				labelText="Type"
				fieldName="place_type"
				fieldValue={filters.place_type.value}
				options={placeTypes}
				onValueChange={(value) =>
					setFilterValue('place_type', value as PlaceTypeEnum)
				}
			/>

			<FormFiltersReset source="DataTablePlacesFilters" />
		</div>
	);
};
