'use client';

import { type JSX, useCallback, useEffect } from 'react';
import { useStore } from 'zustand/react';
import {
	FormFiltersDateRange,
	FormFiltersReset,
	FormFiltersSearch,
	FormFiltersSelect,
} from '@/app/(dashboard)/_components/form-filters.component';
import { useDataTable } from '@/app/(dashboard)/_providers/data-table-provider';
import type { CashFlowDataTableFiltersType } from '@/app/(dashboard)/dashboard/cash-flow/cash-flow.definition';
import { formatEnumLabel } from '@/helpers/string.helper';
import { useSearchFilter } from '@/hooks/use-search-filter.hook';
import {
	CashFlowCategoryEnum,
	CashFlowDirectionEnum,
	type CashFlowModel,
	CashFlowStatusEnum,
	CurrencyEnum,
} from '@/models/cash-flow.model';

const directions = Object.values(CashFlowDirectionEnum).map((v) => ({
	label: formatEnumLabel(v),
	value: v,
}));

const categories = Object.values(CashFlowCategoryEnum).map((v) => ({
	label: formatEnumLabel(v),
	value: v,
}));

const statuses = Object.values(CashFlowStatusEnum).map((v) => ({
	label: formatEnumLabel(v),
	value: v,
}));

const currencies = Object.values(CurrencyEnum).map((v) => ({
	label: v,
	value: v,
}));

export const DataTableCashFlowFilters = (): JSX.Element => {
	const { stateDefault, dataTableStore } = useDataTable<
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
		initialValue: filters.global?.value ?? '',
		debounceDelay: 1000,
		minLength: 2,
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
			<FormFiltersSearch<CashFlowDataTableFiltersType>
				labelText="ID / Transaction / Reference / Notes"
				search={searchGlobal}
			/>

			<FormFiltersSelect<CashFlowDataTableFiltersType>
				labelText="Direction"
				fieldName="direction"
				fieldValue={filters.direction.value}
				options={directions}
				onValueChange={(value) =>
					setFilterValue('direction', value as CashFlowDirectionEnum)
				}
			/>

			<FormFiltersSelect<CashFlowDataTableFiltersType>
				labelText="Category"
				fieldName="category"
				fieldValue={filters.category.value}
				options={categories}
				onValueChange={(value) =>
					setFilterValue('category', value as CashFlowCategoryEnum)
				}
			/>

			<FormFiltersSelect<CashFlowDataTableFiltersType>
				labelText="Status"
				fieldName="status"
				fieldValue={filters.status.value}
				options={statuses}
				onValueChange={(value) =>
					setFilterValue('status', value as CashFlowStatusEnum)
				}
			/>

			<FormFiltersSelect<CashFlowDataTableFiltersType>
				labelText="Currency"
				fieldName="currency"
				fieldValue={filters.currency.value}
				options={currencies}
				onValueChange={(value) =>
					setFilterValue('currency', value as CurrencyEnum)
				}
			/>

			<FormFiltersDateRange<CashFlowDataTableFiltersType>
				labelText="Create Date"
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

			<FormFiltersReset source="DataTableCashFlowFilters" />
		</div>
	);
};
