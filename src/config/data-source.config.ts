import type React from 'react';
import type { DataTableColumnType } from '@/app/(dashboard)/_components/data-table-value';
import type {
	WindowConfigPropsType,
	WindowInstanceType,
} from '@/stores/window.store';
import type { ApiResponseFetch, QueryFiltersType } from '@/types/api.type';
import type {
	FormStateType,
	FormValuesType,
	GetFormValuesFnType,
	SyncFormStateFnType,
	ValidateFormFnType,
} from '@/types/form.type';
import type { ActionButtonPropsType } from '@/types/html.type';

// ============================================================================
// Action Function Types
// ============================================================================

export type FindFunctionParamsType = {
	order_by?: string;
	direction?: 'ASC' | 'DESC';
	limit?: number;
	page?: number;
	filter?: QueryFiltersType;
};

export type FindFunctionResponseType<Model> = {
	entries: Model[];
	pagination: {
		page: number;
		limit: number;
		total: number;
	};
};

export type FindFunctionType<Model> = (
	params: FindFunctionParamsType,
) => Promise<FindFunctionResponseType<Model> | undefined>;

export type CreateFunctionType<Model, FormValues extends FormValuesType> = (
	data: FormValues,
) => Promise<ApiResponseFetch<Partial<Model>>>;

export type UpdateFunctionType<Model, FormValues extends FormValuesType> = (
	data: FormValues,
	id: number,
) => Promise<ApiResponseFetch<Partial<Model>>>;

export type DeleteFunctionType = (
	ids: number[],
) => Promise<ApiResponseFetch<null>>;

// ============================================================================
// Action Types
// ============================================================================

export type DataTableCustomEntrySelectedType<Model> = (
	entry: Model,
) => Promise<BaseModelType | null>;

export type ActionConfigType<Model, FormValues> = {
	windowType: WindowInstanceType;
	windowComponent?: React.ComponentType<any>;
	windowConfigProps?: WindowConfigPropsType;
	permission: string; // Policy related
	entriesSelection: 'free' | 'single' | 'multiple'; // Allowed entries selection (eg: `free` means no selection)
	customEntryCheck?: (entry: Model) => boolean;
	customEntrySelected?: DataTableCustomEntrySelectedType<Model>; // TODO maybe windowEntries
	operationFunction?: unknown;
	actionPosition: 'left' | 'right' | 'hidden'; // Describe where the action button should be placed
	button?: ActionButtonPropsType; // Describe the action button properties; When `windowType` is `form` The properties are also used for the form submit button
	validateForm?: ValidateFormFnType<FormValues>;
	getFormValues?: GetFormValuesFnType<FormValues>;
	syncFormState?: SyncFormStateFnType<FormValues, Model>;
};

type TypedActionConfigType<Model, FormValues, Fn> = ActionConfigType<
	Model,
	FormValues
> & {
	operationFunction?: Fn;
};

type ActionsType<Model, FormValues extends FormValuesType = FormValuesType> = {
	[key: string]: ActionConfigType<Model, FormValues>;
} & {
	create?: TypedActionConfigType<
		Model,
		FormValues,
		CreateFunctionType<Model, FormValues>
	>;
	update?: TypedActionConfigType<
		Model,
		FormValues,
		UpdateFunctionType<Model, FormValues>
	>;
	delete?: TypedActionConfigType<Model, FormValues, DeleteFunctionType>;
	// TODO add restore maybe
};

// ============================================================================
// Data Table Types
// ============================================================================

export type DataTableSelectionModeType = 'checkbox' | 'multiple' | null;

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

export type DataSourceConfigType<
	Model,
	Function,
	FormValues extends FormValuesType,
> = {
	dataTable: {
		state: DataTableStateType;
		columns: DataTableColumnType<Model>[];
		find: FindFunctionType<Model>;
		displayActionEntries?: DisplayActionEntriesFunctionType<Model>;
		onRowSelect?: (entry: Model) => void;
		onRowUnselect?: (entry: Model) => void;
	};

	formState?: FormStateType<FormValues>;
	actions?: ActionsType<Model, FormValues>;
};

const registry: Partial<
	// biome-ignore lint/suspicious/noExplicitAny: It's fine
	Record<DataSourceKey, DataSourceConfigType<any, any, any>>
> = {};

export function registerDataSource<
	K extends DataSourceKey,
	Model,
	Function,
	FormValues extends FormValuesType,
>(key: K, config: DataSourceConfigType<Model, Function, FormValues>) {
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
	P extends keyof DataSourceConfigType<any, any, any>,
	// biome-ignore lint/suspicious/noExplicitAny: It's fine
>(key: K, prop: P): DataSourceConfigType<any, any, any>[P] {
	const config = registry[key];

	if (!config) {
		throw new Error(`DataSource "${key}" is not registered`);
	}

	return config[prop];
}

// export function hasValidateForm<FormValues>(functions: unknown): functions is {
// 	validateForm: ValidateFormFnType<FormValues>;
// } {
// 	return (
// 		typeof functions === 'object' &&
// 		functions !== null &&
// 		'validateForm' in functions &&
// 		// biome-ignore lint/suspicious/noExplicitAny: It's fine
// 		typeof (functions as any).validateForm === 'function'
// 	);
// }
//
// export function hasSyncFormState<FormValues extends FormValuesType, Model>(
// 	functions: unknown,
// ): functions is {
// 	syncFormState: SyncFormStateFnType<FormValues, Model>;
// } {
// 	return (
// 		typeof functions === 'object' &&
// 		functions !== null &&
// 		'syncFormState' in functions &&
// 		typeof functions.syncFormState === 'function'
// 	);
// }
