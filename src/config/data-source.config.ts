import type React from 'react';
import type { DataTableColumnType } from '@/app/(dashboard)/_components/data-table-value';
import { dataSourceConfigBrands } from '@/app/(dashboard)/dashboard/brands/brands.definition';
import { dataSourceConfigCashFlow } from '@/app/(dashboard)/dashboard/cash-flow/cash-flow.definition';
import { dataSourceConfigClientAddress } from '@/app/(dashboard)/dashboard/client-address/client-address.definition';
import { dataSourceConfigClients } from '@/app/(dashboard)/dashboard/clients/clients.definition';
import { dataSourceConfigCronHistory } from '@/app/(dashboard)/dashboard/cron-history/cron-history.definition';
import { dataSourceConfigLogData } from '@/app/(dashboard)/dashboard/log-data/log-data.definition';
import { dataSourceConfigLogHistory } from '@/app/(dashboard)/dashboard/log-history/log-history.definition';
import { dataSourceConfigMailQueue } from '@/app/(dashboard)/dashboard/mail-queue/mail-queue.definition';
import { dataSourceConfigPermissions } from '@/app/(dashboard)/dashboard/permissions/permissions.definition';
import { dataSourceConfigPlaces } from '@/app/(dashboard)/dashboard/places/places.definition';
import { dataSourceConfigTemplates } from '@/app/(dashboard)/dashboard/templates/templates.definition';
import { dataSourceConfigUsers } from '@/app/(dashboard)/dashboard/users/users.definition';
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

export const dataSourceConfig: {
	[K in DataSourceKey]: DataSourceConfigType<K, any, any>;
} = {
	brands: dataSourceConfigBrands,
	'cash-flow': dataSourceConfigCashFlow,
	'client-address': dataSourceConfigClientAddress,
	clients: dataSourceConfigClients,
	'cron-history': dataSourceConfigCronHistory,
	'log-data': dataSourceConfigLogData,
	'log-history': dataSourceConfigLogHistory,
	'mail-queue': dataSourceConfigMailQueue,
	permissions: dataSourceConfigPermissions,
	places: dataSourceConfigPlaces,
	templates: dataSourceConfigTemplates,
	users: dataSourceConfigUsers,
};

export type DataSourceRegistry = typeof dataSourceConfig;

export function getDataSourceConfig<
	K extends DataSourceKey,
	P extends keyof DataSourceRegistry[K],
>(key: K, prop: P): DataSourceRegistry[K][P] {
	const config = dataSourceConfig[key];

	if (!config) {
		throw new Error(`DataSource "${key}" is not registered`);
	}

	return config[prop];
}
