'use client';

import type React from 'react';
import { useCallback, useEffect, useMemo } from 'react';
import { useStore } from 'zustand/react';
import {
	FormFiltersReset,
	FormFiltersSearch,
	FormFiltersSelect,
	FormFiltersShowDeleted,
} from '@/app/(dashboard)/_components/form-filters.component';
import { useDataTable } from '@/app/(dashboard)/_providers/data-table-provider';
import type { TemplateDataTableFiltersType } from '@/app/(dashboard)/dashboard/templates/templates.definition';
import { capitalizeFirstLetter } from '@/helpers/string.helper';
import { useSearchFilter } from '@/hooks/use-search-filter.hook';
import { useTranslation } from '@/hooks/use-translation.hook';
import { type TemplateModel, TemplateTypeEnum } from '@/models/template.model';
import {LanguageEnum} from '@/models/user.model';

const languages = Object.values(LanguageEnum).map((language) => ({
	label: capitalizeFirstLetter(language),
	value: language,
}));

const types = Object.values(TemplateTypeEnum).map((v) => ({
	label: capitalizeFirstLetter(v),
	value: v,
}));

export const DataTableTemplatesFilters = (): React.JSX.Element => {
	const { stateDefault, dataTableStore } = useDataTable<
		'templates',
		TemplateModel
	>();

	const translationsKeys = useMemo(
		() =>
			[
				'templates.form_filters.label_global',
				'templates.form_filters.label_language',
				'templates.form_filters.label_type',
			] as const,
		[],
	);

	const { translations } = useTranslation(translationsKeys);

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
			<FormFiltersSearch<TemplateDataTableFiltersType>
				labelText={translations['templates.form_filters.label_global']}
				search={searchGlobal}
			/>

			<FormFiltersSelect<TemplateDataTableFiltersType>
				labelText={translations['templates.form_filters.label_language']}
				fieldName="language"
				fieldValue={filters.language.value}
				options={languages}
				onValueChange={(value) =>
					setFilterValue('language', value)
				}
			/>

			<FormFiltersSelect<TemplateDataTableFiltersType>
				labelText={translations['templates.form_filters.label_type']}
				fieldName="type"
				fieldValue={filters.type.value}
				options={types}
				onValueChange={(value) =>
					setFilterValue('type', value as TemplateTypeEnum)
				}
			/>

			<FormFiltersShowDeleted
				checked={filters.is_deleted?.value || false}
				onCheckedChange={(value) => setFilterValue('is_deleted', value)}
			/>

			<FormFiltersReset source="DataTableTemplatesFilters" />
		</div>
	);
};
