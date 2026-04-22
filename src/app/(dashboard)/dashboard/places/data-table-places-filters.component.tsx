'use client';

import { type JSX, useCallback, useMemo } from 'react';
import { useStore } from 'zustand/react';
import {
	FormFiltersReset,
	FormFiltersSearch,
	FormFiltersSelect,
	FormFiltersShowDeleted,
} from '@/app/(dashboard)/_components/form-filters.component';
import { useDataTable } from '@/app/(dashboard)/_providers/data-table.provider';
import type { PlacesDataTableFiltersType } from '@/app/(dashboard)/dashboard/places/places.definition';
import type { TemplateDataTableFiltersType } from '@/app/(dashboard)/dashboard/templates/templates.definition';
import { toOptionsFromEnum } from '@/helpers/form.helper';
import { formatEnumLabel } from '@/helpers/string.helper';
import { useDataTableFilterReset } from '@/hooks/use-data-table-filter-reset.hook';
import { useSearchFilter } from '@/hooks/use-search-filter.hook';
import {
	type PlaceModel,
	type PlaceType,
	PlaceTypeEnum,
} from '@/models/place.model';
import {
	LANGUAGE_DEFAULT,
	type Language,
	LanguageEnum,
} from '@/types/common.type';

const placeTypes = toOptionsFromEnum(PlaceTypeEnum, {
	formatter: formatEnumLabel,
});

const languages = toOptionsFromEnum(LanguageEnum, {
	formatter: formatEnumLabel,
});

export const DataTablePlacesFilters = (): JSX.Element => {
	const { dataSource, dataTableStateDefault, dataTableStore } = useDataTable<
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
		initialValue: filters.global.value ?? '',
		debounceDelay: 1000,
		minLength: 3,
		onSearch: (value) => setFilterValue('global', value),
	});

	const resetCallbacks = useMemo(
		() => [searchGlobal.onReset],
		[searchGlobal.onReset],
	);

	useDataTableFilterReset({
		dataSource,
		defaultFilters: dataTableStateDefault.filters,
		updateTableState,
		onReset: resetCallbacks,
	});

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
				onChange={(value) =>
					setFilterValue('place_type', value as PlaceType)
				}
			/>

			<FormFiltersSelect<TemplateDataTableFiltersType>
				labelText="Language"
				fieldName="language"
				fieldValue={filters.language.value ?? LANGUAGE_DEFAULT}
				options={languages}
				onChange={(value) =>
					setFilterValue('language', value as Language)
				}
			/>

			<FormFiltersShowDeleted
				checked={filters.is_deleted.value ?? false}
				onCheckedChange={(value) => setFilterValue('is_deleted', value)}
			/>

			<FormFiltersReset dataSource="places" />
		</div>
	);
};
