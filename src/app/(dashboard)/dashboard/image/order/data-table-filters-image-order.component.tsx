'use client';

import type { JSX } from 'react';
import { useStore } from 'zustand/react';
import { FormFiltersSelect } from '@/app/(dashboard)/_components/form-filters.component';
import { useDataTable } from '@/app/(dashboard)/_providers/data-table.provider';
import type { ImageDataTableFiltersType } from '@/app/(dashboard)/dashboard/image/image.definition';
import type { TemplateDataTableFiltersType } from '@/app/(dashboard)/dashboard/template/template.definition';
import { getLanguageClient } from '@/config/translate.setup';
import { toOptionsFromEnum } from '@/helpers/form.helper';
import { formatEnumLabel } from '@/helpers/string.helper';
import { useDataTableFilterReset } from '@/hooks/use-data-table-filter-reset.hook';
import { useSetFilterValues } from '@/hooks/use-set-filter-values.hook';
import { type ImageType, ImageTypeEnum } from '@/models/image.model';
import { type Language, LanguageEnum } from '@/types/common.type';

const imageTypes = toOptionsFromEnum(ImageTypeEnum, {
	formatter: formatEnumLabel,
});

const languages = toOptionsFromEnum(LanguageEnum, {
	formatter: formatEnumLabel,
});

export const DataTableFiltersImageOrder = (): JSX.Element => {
	const { dataSource, dataTableStateDefault, dataTableStore } =
		useDataTable<'image'>();

	const filters = useStore(
		dataTableStore,
		(state) => state.tableState.filters,
	) as ImageDataTableFiltersType;

	const updateTableState = useStore(
		dataTableStore,
		(state) => state.updateTableState,
	);

	const { setFilterValue } = useSetFilterValues<ImageDataTableFiltersType>(
		dataTableStore,
		updateTableState,
	);

	useDataTableFilterReset({
		dataSource,
		defaultFilters: dataTableStateDefault.filters,
		updateTableState,
	});

	return (
		<div className="form-section flex-row flex-wrap gap-4 border-b border-line pb-4">
			<FormFiltersSelect<ImageDataTableFiltersType>
				labelText="Type"
				fieldName="image_type"
				fieldValue={filters.image_type.value ?? imageTypes[0].value}
				options={imageTypes}
				onChange={(value) =>
					setFilterValue('image_type', value as ImageType)
				}
			/>

			<FormFiltersSelect<TemplateDataTableFiltersType>
				labelText="Language"
				fieldName="language"
				fieldValue={filters.language.value ?? getLanguageClient()}
				options={languages}
				onChange={(value) =>
					setFilterValue('language', value as Language)
				}
			/>
		</div>
	);
};
