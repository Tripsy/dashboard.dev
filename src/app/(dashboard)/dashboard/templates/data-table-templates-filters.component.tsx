'use client';

import type React from 'react';
import { useCallback, useMemo } from 'react';
import { useStore } from 'zustand/react';
import {
	FormFiltersReset,
	FormFiltersSearch,
	FormFiltersSelect,
	FormFiltersShowDeleted,
} from '@/app/(dashboard)/_components/form-filters.component';
import { useDataTable } from '@/app/(dashboard)/_providers/data-table.provider';
import type { TemplateDataTableFiltersType } from '@/app/(dashboard)/dashboard/templates/templates.definition';
import { toOptionsFromEnum } from '@/helpers/form.helper';
import { formatEnumLabel } from '@/helpers/string.helper';
import { useDataTableFilterReset } from '@/hooks/use-data-table-filter-reset.hook';
import { useSearchFilter } from '@/hooks/use-search-filter.hook';
import {
	type TemplateModel,
	type TemplateType,
	TemplateTypeEnum,
} from '@/models/template.model';
import { LanguageEnum } from '@/types/common.type';

const languages = toOptionsFromEnum(LanguageEnum, {
	formatter: formatEnumLabel,
});

const types = toOptionsFromEnum(TemplateTypeEnum, {
	formatter: formatEnumLabel,
});

export const DataTableTemplatesFilters = (): React.JSX.Element => {
	const { dataSource, dataTableStateDefault, dataTableStore } = useDataTable<
		'templates',
		TemplateModel
	>();

	const filters = useStore(
		dataTableStore,
		(state) => state.tableState.filters,
	) as TemplateDataTableFiltersType;

	const updateTableState = useStore(
		dataTableStore,
		(state) => state.updateTableState,
	);

	const setFilterValue = useCallback(
		<K extends keyof TemplateDataTableFiltersType>(
			key: K,
			value: TemplateDataTableFiltersType[K]['value'],
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
			<FormFiltersSearch<TemplateDataTableFiltersType>
				labelText="ID / Label / Content"
				search={searchGlobal}
			/>

			<FormFiltersSelect<TemplateDataTableFiltersType>
				labelText="Language"
				fieldName="language"
				fieldValue={filters.language.value}
				options={languages}
				onChange={(value) => setFilterValue('language', value)}
			/>

			<FormFiltersSelect<TemplateDataTableFiltersType>
				labelText="Type"
				fieldName="type"
				fieldValue={filters.type.value}
				options={types}
				onChange={(value) =>
					setFilterValue('type', value as TemplateType)
				}
			/>

			<FormFiltersShowDeleted
				checked={filters.is_deleted.value ?? false}
				onCheckedChange={(value) => setFilterValue('is_deleted', value)}
			/>

			<FormFiltersReset dataSource="templates" />
		</div>
	);
};
