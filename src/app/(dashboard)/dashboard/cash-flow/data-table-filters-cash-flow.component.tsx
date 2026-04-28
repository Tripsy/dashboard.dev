'use client';

import { type JSX, useCallback, useMemo } from 'react';
import { useStore } from 'zustand/react';
import {
	FormFiltersDateRange,
	FormFiltersReset,
	FormFiltersSearch,
	FormFiltersSelect,
	FormFiltersShowDeleted,
} from '@/app/(dashboard)/_components/form-filters.component';
import { useDataTable } from '@/app/(dashboard)/_providers/data-table.provider';
import type { CashFlowDataTableFiltersType } from '@/app/(dashboard)/dashboard/cash-flow/cash-flow.definition';
import { toOptionsFromEnum } from '@/helpers/form.helper';
import { formatEnumLabel } from '@/helpers/string.helper';
import { useDataTableFilterReset } from '@/hooks/use-data-table-filter-reset.hook';
import { useSearchFilter } from '@/hooks/use-search-filter.hook';
import {
	type CashFlowCategory,
	type CashFlowDirection,
	CashFlowDirectionEnum,
	type CashFlowMethod,
	CashFlowMethodEnum,
	type CashFlowModel,
	type CashFlowStatus,
	CashFlowStatusEnum,
	GroupedCategories,
} from '@/models/cash-flow.model';
import { type Currency, CurrencyEnum } from '@/types/common.type';

const statuses = toOptionsFromEnum(CashFlowStatusEnum, {
	formatter: formatEnumLabel,
});

const directions = toOptionsFromEnum(CashFlowDirectionEnum, {
	formatter: formatEnumLabel,
});

const currencies = toOptionsFromEnum(CurrencyEnum, {
	formatter: formatEnumLabel,
});

const methods = toOptionsFromEnum(CashFlowMethodEnum, {
	formatter: formatEnumLabel,
});

export const DataTableFiltersCashFlow = (): JSX.Element => {
	const { dataSource, dataTableStateDefault, dataTableStore } = useDataTable<
		'cash-flow',
		CashFlowModel
	>();

	const filters = useStore(
		dataTableStore,
		(state) => state.tableState.filters,
	) as CashFlowDataTableFiltersType;

	const updateTableState = useStore(
		dataTableStore,
		(state) => state.updateTableState,
	);

	const setFilterValue = useCallback(
		<K extends keyof CashFlowDataTableFiltersType>(
			key: K,
			value: CashFlowDataTableFiltersType[K]['value'],
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
			<FormFiltersSearch<CashFlowDataTableFiltersType>
				labelText="ID / Reference / Notes"
				search={searchGlobal}
			/>

			<FormFiltersSelect<CashFlowDataTableFiltersType>
				labelText="Direction"
				fieldName="direction"
				fieldValue={filters.direction.value}
				options={directions}
				onChange={(value) =>
					setFilterValue('direction', value as CashFlowDirection)
				}
			/>

			<FormFiltersSelect<CashFlowDataTableFiltersType>
				labelText="Category"
				fieldName="category"
				fieldValue={filters.category.value}
				options={GroupedCategories}
				onChange={(value) =>
					setFilterValue('category', value as CashFlowCategory)
				}
			/>

			<FormFiltersSelect<CashFlowDataTableFiltersType>
				labelText="Method"
				fieldName="method"
				fieldValue={filters.method?.value ?? null}
				options={methods}
				onChange={(value) =>
					setFilterValue('method', value as CashFlowMethod)
				}
			/>

			<FormFiltersSelect<CashFlowDataTableFiltersType>
				labelText="Currency"
				fieldName="currency"
				fieldValue={filters.currency.value}
				options={currencies}
				onChange={(value) =>
					setFilterValue('currency', value as Currency)
				}
			/>

			<FormFiltersSelect<CashFlowDataTableFiltersType>
				labelText="Status"
				fieldName="status"
				fieldValue={filters.status.value}
				options={statuses}
				onChange={(value) =>
					setFilterValue('status', value as CashFlowStatus)
				}
			/>

			<FormFiltersDateRange<CashFlowDataTableFiltersType>
				labelText="Create Date"
				start={{
					fieldName: 'create_at_start',
					fieldValue: filters.create_at_start.value,
					onSelect: (value) =>
						setFilterValue('create_at_start', value),
				}}
				end={{
					fieldName: 'create_at_end',
					fieldValue: filters.create_at_end.value,
					onSelect: (value) =>
						setFilterValue('create_at_end', value),
				}}
			/>

			<FormFiltersShowDeleted
				checked={filters.is_deleted.value ?? false}
				onCheckedChange={(value) => setFilterValue('is_deleted', value)}
			/>

			<FormFiltersReset dataSource="cash-flow" />
		</div>
	);
};
