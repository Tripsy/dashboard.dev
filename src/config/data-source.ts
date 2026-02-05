import type { DataTableColumnType } from '@/app/(dashboard)/_components/data-table-value';
import type { ValidateFormFunctionType } from '@/hooks/use-form-validation.hook';
import type { FormSituationType } from '@/types';
import type { ApiResponseFetch } from '@/types/api.type';

const dataSourceConfig: Record<string, any> = {};
export type DataSourceKey = keyof typeof dataSourceConfig;

export type BaseEntityType = {
	id: number;
};

export type DataTableEntryRecordType = Record<string, unknown>;

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

export type FormStateValuesType = Record<string, unknown>;
type EmptyFormValues = Record<never, never>;

export type FormStateType<
	K extends DataSourceKey,
	Entity,
	FormValues extends FormStateValuesType,
> = {
	dataSource: K;
	id?: number;
	values: FormValues;
	errors: Partial<Record<keyof FormValues, string[]>>;
	message: string | null;
	situation: FormSituationType;
	resultData?: Partial<Entity>;
};

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

export type FindFunctionResponseType<Entity> = {
	entries: Entity[];
	pagination: {
		page: number;
		limit: number;
		total: number;
	};
};

export type FindFunctionType<Entity> = (
	params: FindFunctionParamsType,
) => Promise<FindFunctionResponseType<Entity> | undefined>;

export type CreateFunctionType<
	Entity,
	FormValues extends FormStateValuesType,
> = (data: FormValues) => Promise<ApiResponseFetch<Partial<Entity>>>;

export type UpdateFunctionType<
	Entity,
	FormValues extends FormStateValuesType,
> = (
	data: FormValues,
	id: number,
) => Promise<ApiResponseFetch<Partial<Entity>>>;

export type DeleteFunctionType = (
	ids: number[],
) => Promise<ApiResponseFetch<null>>;

// ============================================================================
// Action Types
// ============================================================================

type DataTableActionType = 'view' | 'create' | 'update' | 'delete';
type DataTableActionMode = 'form' | 'action' | 'other';
type DataTableEntryRequirement = 'free' | 'single' | 'multiple';
type DataTableActionPosition = 'left' | 'right' | 'hidden';

export type DataTableActionConfigType<Entity, Function> = {
	type?: DataTableActionType;
	mode: DataTableActionMode;
	permission: string;
	allowedEntries: DataTableEntryRequirement;
	customEntryCheck?: (entry: Entity) => boolean;
	position: DataTableActionPosition;
	function?: Function;
	button?: {
		className: string;
	};
};

export type DataTableActionsType<
	Entity,
	FormValues extends FormStateValuesType,
> = {
	[key: string]: DataTableActionConfigType<Entity, unknown>;
} & {
	create?: DataTableActionConfigType<
		Entity,
		CreateFunctionType<Entity, FormValues>
	>;
	update?: DataTableActionConfigType<
		Entity,
		UpdateFunctionType<Entity, FormValues>
	>;
	delete?: DataTableActionConfigType<Entity, DeleteFunctionType>;
};

// ============================================================================
// Form Types
// ============================================================================

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

export type DisplayActionEntriesFunctionType<Entity> = (
	entries: Entity[],
) => Array<{ id: number; label: string }>;

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
	FormValues extends FormStateValuesType,
>(key: string, config: DataSourceConfigType<K, Entity, FormValues>) {
	dataSourceConfig[key] = config;
}

export function getDataSourceConfig<
	K extends DataSourceKey,
	Entity,
	FormValues extends FormStateValuesType,
	P extends keyof DataSourceConfigType<K, Entity, FormValues>,
>(key: string, prop: P): DataSourceConfigType<K, Entity, FormValues>[P] {
	return dataSourceConfig[key][prop];
}
