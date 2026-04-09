import type React from 'react';
import type { DataTableColumnType } from '@/app/(dashboard)/_components/data-table-value';
import type {
	CreateFunctionType,
	DeleteFunctionType,
	FindFunctionType,
	OperationFunctionType,
	RestoreFunctionType,
	UpdateFunctionType,
} from '@/types/action-function.type';
import type {
	FormEventType,
	FormStateType,
	FormValuesType,
	GetFormStateFnType,
	GetFormValuesFnType,
	ValidateFormFnType,
} from '@/types/form.type';
import type { ActionButtonPropsType } from '@/types/html.type';
import type {
	WindowConfigPropsType,
	WindowInstanceType,
} from '@/types/window.type';

// ============================================================================
// Data Table Types
// ============================================================================

export type DataTableSelectionModeType = 'checkbox' | 'multiple' | null;

export type DataTableCustomEntrySelectedType<Model> = (
	entry: Model,
) => Promise<BaseModelType | null>;

export type DataTableFiltersType = {
	[key: string]: {
		value: string | number | boolean | Date | null;
		matchMode:
			| 'contains'
			| 'equals'
			| 'startsWith'
			| 'endsWith'
			| 'gt'
			| 'lt';
	};
};

export type DataTableStateType = {
	first: number;
	rows: number;
	sortField: string;
	sortOrder: 1 | 0 | -1 | null | undefined;
	filters: DataTableFiltersType;
};

export type DisplayActionEntriesFunctionType<Model> = (
	entries: Model[],
) => Array<{ id: number; label: string }>;

// ============================================================================
// Action Types
// ============================================================================

export type ActionConfigType<Entry, FormValues extends FormValuesType> = {
	windowType: WindowInstanceType;
	// biome-ignore lint/suspicious/noExplicitAny: It's fine
	windowComponent?: React.ComponentType<any>;
	windowConfigProps?: WindowConfigPropsType;
	permission: string; // Policy related
	entriesSelection: 'free' | 'single' | 'multiple'; // Allowed entries selection (eg: `free` means no selection)
	customEntryCheck?: (entry: Entry) => boolean;
	customEntrySelected?: DataTableCustomEntrySelectedType<Entry>; // TODO maybe windowEntries
	operationFunction?: OperationFunctionType<Entry, FormValues>;
	actionPosition: 'left' | 'right' | 'hidden'; // Describe where the action button should be placed
	button?: ActionButtonPropsType; // Describe the action button properties; When `windowType` is `form` The properties are also used for the form submit button
	validateForm?: ValidateFormFnType<FormValues>;
	getFormValues?: GetFormValuesFnType<FormValues>;
	getFormState?: GetFormStateFnType<FormValues, Entry>;
	events?: Record<string, FormEventType<Entry>>;
};

type TypedActionConfigType<
	Entry,
	FormValues extends FormValuesType,
	Fn,
> = ActionConfigType<Entry, FormValues> & {
	operationFunction?: Fn;
};

type ActionsType<Entry, FormValues extends FormValuesType = FormValuesType> = {
	[key: string]: ActionConfigType<Entry, FormValues>;
} & {
	create?: TypedActionConfigType<
		Entry,
		FormValues,
		CreateFunctionType<Entry, FormValues>
	>;
	update?: TypedActionConfigType<
		Entry,
		FormValues,
		UpdateFunctionType<Entry, FormValues>
	>;
	delete?: TypedActionConfigType<Entry, FormValues, DeleteFunctionType>;
	restore?: TypedActionConfigType<Entry, FormValues, RestoreFunctionType>;
};

// ============================================================================
// Data Source
// ============================================================================

export type BaseModelType = {
	id: number;
};

export type DataSourceKey =
	| 'brands'
	| 'cash-flow'
	| 'client-address'
	| 'clients'
	| 'cron-history'
	| 'log-data'
	| 'log-history'
	| 'mail-queue'
	| 'permissions'
	| 'places'
	| 'templates'
	| 'users';

export type DataSourceConfigType<Entry, FormValues extends FormValuesType> = {
	dataTable: {
		state: DataTableStateType;
		columns: DataTableColumnType<Entry>[];
		find: FindFunctionType<Entry>;
		displayActionEntries?: DisplayActionEntriesFunctionType<Entry>;
		onRowSelect?: (entry: Entry) => void;
		onRowUnselect?: (entry: Entry) => void;
	};

	formState?: FormStateType<FormValues>;
	actions?: ActionsType<Entry, FormValues>;
};

const registry: Partial<
	// biome-ignore lint/suspicious/noExplicitAny: It's fine
	Record<DataSourceKey, DataSourceConfigType<any, any>>
> = {};

export function registerDataSource<
	K extends DataSourceKey,
	Model,
	FormValues extends FormValuesType,
>(key: K, config: DataSourceConfigType<Model, FormValues>) {
	if (hasDataSourceConfig(key)) {
		return;
	}

	registry[key] = config;
}

export function hasDataSourceConfig<K extends DataSourceKey>(key: K): boolean {
	return !!registry[key];
}

export function getDataSourceConfig<
	K extends DataSourceKey,
	// biome-ignore lint/suspicious/noExplicitAny: It's fine
	P extends keyof DataSourceConfigType<any, any>,
	// biome-ignore lint/suspicious/noExplicitAny: It's fine
>(key: K, prop: P): DataSourceConfigType<any, any>[P] {
	const config = registry[key];

	if (!config) {
		throw new Error(`DataSource "${key}" is not registered`);
	}

	return config[prop];
}
