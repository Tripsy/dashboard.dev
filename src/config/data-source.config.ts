import type React from 'react';
import type { DataTableColumnType } from '@/app/(dashboard)/_components/data-table-value';
import type {
	ButtonHover,
	ButtonSize,
	ButtonVariant,
} from '@/components/ui/button';
import type { ModalSizeType } from '@/components/ui/modal';
import type { ValidateFormFunctionType } from '@/hooks/use-form-validation.hook';
import type { ApiResponseFetch, QueryFiltersType } from '@/types/api.type';
import type { FormSituationType } from '@/types/form.type';

// ============================================================================
// API Function Types
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
		field: keyof FormValues,
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

// type DataTableActionType = 'view' | 'create' | 'update' | 'delete';
type DataTableActionMode = 'form' | 'action' | 'view' | 'other';
type DataTableEntryRequirement = 'free' | 'single' | 'multiple';
type DataTableActionPosition = 'left' | 'right' | 'hidden';

export type DataTableActionButtonPropsType = {
	className?: string;
	variant?: ButtonVariant;
	size?: ButtonSize;
	hover?: ButtonHover;
	icon?: string;
};

export type DataTableCustomEntrySelectedType<Model> = (
	entry: Model,
) => Promise<BaseModelType | null>;

export type DataTableActionConfigType<Model, Function> = {
	// biome-ignore lint/suspicious/noExplicitAny: It's fine
	component?: React.ComponentType<any>;
	modalProps?: {
		size?: ModalSizeType;
		className?: string;
	};
	// type?: DataTableActionType;
	mode: DataTableActionMode;
	permission: string;
	allowedEntries: DataTableEntryRequirement;
	customEntryCheck?: (entry: Model) => boolean;
	customEntrySelected?: DataTableCustomEntrySelectedType<Model>;
	position: DataTableActionPosition;
	function?: Function;
	buttonProps?: DataTableActionButtonPropsType;
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

const registry: Partial<
	// biome-ignore lint/suspicious/noExplicitAny: It's fine
	Record<DataSourceKey, DataSourceConfigType<any, any, any>>
> = {};

export function registerDataSource<
	K extends DataSourceKey,
	Entity,
	FormValues extends FormStateValuesType = EmptyFormValues,
>(key: K, config: DataSourceConfigType<K, Entity, FormValues>) {
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
	P extends keyof DataSourceConfigType<K, any, any>,
	// biome-ignore lint/suspicious/noExplicitAny: It's fine
>(key: K, prop: P): DataSourceConfigType<K, any, any>[P] {
	const config = registry[key];

	if (!config) {
		throw new Error(`DataSource "${key}" is not registered`);
	}

	return config[prop];
}

export function hasValidateForm<FormValues>(functions: unknown): functions is {
	validateForm: ValidateFormFunctionType<FormValues>;
} {
	return (
		typeof functions === 'object' &&
		functions !== null &&
		'validateForm' in functions &&
		// biome-ignore lint/suspicious/noExplicitAny: It's fine
		typeof (functions as any).validateForm === 'function'
	);
}

export function hasSyncFormState<
	K extends DataSourceKey,
	Entity,
	FormValues extends FormStateValuesType,
>(
	functions: unknown,
): functions is {
	syncFormState: ValidateSyncFormStateFunctionType<K, Entity, FormValues>;
} {
	return (
		typeof functions === 'object' &&
		functions !== null &&
		'syncFormState' in functions &&
		typeof functions.syncFormState === 'function'
	);
}
