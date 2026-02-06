import type { DataTableColumnType } from '@/app/(dashboard)/_components/data-table-value';
import type { ValidateFormFunctionType } from '@/hooks/use-form-validation.hook';
import type { FormSituationType } from '@/types';
import type { ApiResponseFetch } from '@/types/api.type';

// ============================================================================
// API Function Types
// ============================================================================

export type FindFunctionParamsType = {
	order_by?: string;
	direction?: 'ASC' | 'DESC';
	limit?: number;
	page?: number;
	filter?: string;
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

export type CreateFunctionType<
	Model,
	FormValues extends FormStateValuesType,
> = (data: FormValues) => Promise<ApiResponseFetch<Partial<Model>>>;

export type UpdateFunctionType<
	Model,
	FormValues extends FormStateValuesType,
> = (data: FormValues, id: number) => Promise<ApiResponseFetch<Partial<Model>>>;

export type DeleteFunctionType = (
	ids: number[],
) => Promise<ApiResponseFetch<null>>;

// ============================================================================
// Form Types
// ============================================================================

export type FormStateValuesType = Record<string, unknown>;
type EmptyFormValues = Record<never, never>;

export type FormStateType<
	K extends DataSourceKey,
	Model,
	FormValues extends FormStateValuesType,
> = {
	dataSource: K;
	id?: number;
	values: FormValues;
	errors: Partial<Record<keyof FormValues, string[]>>;
	message: string | null;
	situation: FormSituationType;
	resultData?: Partial<Model>;
};

export type FormManageType<FormValues extends FormStateValuesType> = {
	actionName: 'create' | 'update';
	formValues: FormValues;
	errors: Partial<Record<keyof FormValues, string[]>>;
	handleChange: (
		field: string,
		value: string | boolean | number | Date | null,
	) => void;
	pending: boolean;
};

export type ValidateGetFormValuesFunctionType<FormValues> = (
	formData: FormData,
) => FormValues;

export type ValidateSyncFormStateFunctionType<
	K extends DataSourceKey,
	Entity,
	FormValues extends FormStateValuesType,
> = (
	state: FormStateType<K, Entity, FormValues>,
	model: Entity,
) => FormStateType<K, Entity, FormValues>;

// ============================================================================
// Action Types
// ============================================================================

type DataTableActionType = 'view' | 'create' | 'update' | 'delete';
type DataTableActionMode = 'form' | 'action' | 'other';
type DataTableEntryRequirement = 'free' | 'single' | 'multiple';
type DataTableActionPosition = 'left' | 'right' | 'hidden';

export type DataTableActionConfigType<Model, Function> = {
	type?: DataTableActionType;
	mode: DataTableActionMode;
	permission: string;
	allowedEntries: DataTableEntryRequirement;
	customEntryCheck?: (entry: Model) => boolean;
	position: DataTableActionPosition;
	function?: Function;
	button?: {
		className: string;
	};
};

// ============================================================================
// Data Table Types
// ============================================================================

export type DataTableSelectionModeType = 'checkbox' | 'multiple' | null;

type DataTableBaseFilterType = {
	value: string | number | boolean | Date | null;
	matchMode?: 'contains' | 'equals' | 'startsWith' | 'endsWith' | 'gt' | 'lt';
};

export type DataTableFiltersType = {
	[key: string]: DataTableBaseFilterType;
};

export type DataTableStateType = {
	reloadTrigger: number; // Flag used to reload the data table entries
	first: number;
	rows: number;
	sortField: string;
	sortOrder: 1 | 0 | -1 | null | undefined;
	filters: DataTableFiltersType;
};

export type DisplayActionEntriesFunctionType<Entity> = (
	entries: Entity[],
) => Array<{ id: number; label: string }>;

export type DataTableActionsType<
	Model,
	FormValues extends FormStateValuesType,
> = {
	[key: string]: DataTableActionConfigType<Model, unknown>;
} & {
	create?: DataTableActionConfigType<
		Model,
		CreateFunctionType<Model, FormValues>
	>;
	update?: DataTableActionConfigType<
		Model,
		UpdateFunctionType<Model, FormValues>
	>;
	delete?: DataTableActionConfigType<Model, DeleteFunctionType>;
};

// ============================================================================
// Data Source
// ============================================================================

export type BaseModelType = {
	id: number;
};

export type DataSourceKey =
	| 'cron-history'
	| 'log-data'
	| 'log-history'
	| 'mail-queue'
	| 'permissions'
	| 'templates'
	| 'users';

const dataSourceConfig: Partial<
	// biome-ignore lint/suspicious/noExplicitAny: Concrete types are enforced at the public API boundary (register/get),
	Record<DataSourceKey, DataSourceConfigType<any, any, any>>
> = {};

export type DataSourceConfigType<
	K extends DataSourceKey,
	Entity,
	FormValues extends FormStateValuesType = EmptyFormValues,
> = {
	dataTableState: DataTableStateType;
	dataTableColumns: DataTableColumnType<Entity>[];
	formState?: FormStateType<K, Entity, FormValues>;
	functions: {
		find: FindFunctionType<Entity>;
		onRowSelect?: (entry: Entity) => void;
		onRowUnselect?: (entry: Entity) => void;
		displayActionEntries?: DisplayActionEntriesFunctionType<Entity>;
	} & (FormValues extends EmptyFormValues
		? object
		: {
				validateForm: ValidateFormFunctionType<FormValues>;
				getFormValues: ValidateGetFormValuesFunctionType<FormValues>;
				syncFormState: ValidateSyncFormStateFunctionType<
					K,
					Entity,
					FormValues
				>;
			});
	actions?: DataTableActionsType<Entity, FormValues>;
};

export function registerDataSource<
	K extends DataSourceKey,
	Entity,
	FormValues extends FormStateValuesType = EmptyFormValues,
>(key: K, config: DataSourceConfigType<K, Entity, FormValues>) {
	dataSourceConfig[key] = config;
}

export function getDataSourceConfig<
	K extends DataSourceKey,
	Entity,
	FormValues extends FormStateValuesType,
	P extends keyof DataSourceConfigType<K, Entity, FormValues>,
>(key: K, prop: P): DataSourceConfigType<K, Entity, FormValues>[P] {
	const config = dataSourceConfig[key];

	if (!config) {
		throw new Error(`DataSource "${key}" is not registered`);
	}

	return config[prop];
}
