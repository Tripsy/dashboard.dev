import type React from 'react';
// Data source imports
import {
	DataSourceConfigCronHistory,
	type DataSourceCronHistoryType,
} from '@/app/(dashboard)/dashboard/cron-history/cron-history.definition';
import {
	DataSourceConfigLogData,
	type DataSourceLogDataType,
} from '@/app/(dashboard)/dashboard/log-data/log-data.definition';
import {
	DataSourceConfigLogHistory,
	type DataSourceLogHistoryType,
} from '@/app/(dashboard)/dashboard/log-history/log-history.definition';
import {
	DataSourceConfigMailQueue,
	type DataSourceMailQueueType,
} from '@/app/(dashboard)/dashboard/mail-queue/mail-queue.definition';
import {
	DataSourceConfigPermissions,
	type DataSourcePermissionsType,
} from '@/app/(dashboard)/dashboard/permissions/permissions.definition';
import {
	DataSourceConfigTemplates,
	type DataSourceTemplatesType,
} from '@/app/(dashboard)/dashboard/templates/templates.definition';
import {
	DataSourceConfigUsers,
	type DataSourceUsersType,
} from '@/app/(dashboard)/dashboard/users/users.definition';
import type { ResponseFetch } from '@/helpers/api.helper';
import type { ValidationReturnType } from '@/hooks';
import type { FormSituationType } from '@/types';

// ============================================================================
// Core Types
// ============================================================================

export type DataSourceType = {
	cron_history: DataSourceCronHistoryType;
	log_data: DataSourceLogDataType;
	log_history: DataSourceLogHistoryType;
	mail_queue: DataSourceMailQueueType;
	permissions: DataSourcePermissionsType;
	templates: DataSourceTemplatesType;
	users: DataSourceUsersType;
};

export type DataSourceKey = keyof DataSourceType;

// ============================================================================
// Utility Types
// ============================================================================

export type DataSourceModel<K extends DataSourceKey> =
	DataSourceType[K]['model'];

export type DataSourceFormValues<K extends DataSourceKey> =
	DataSourceType[K] extends { formValues: infer F }
		? F extends Record<string, unknown>
			? F
			: Record<string, unknown>
		: Record<string, unknown>;

export type DataSourceTableFilter<K extends DataSourceKey> =
	DataSourceType[K]['tableFilter'];

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

export type FindFunctionResponseType<K extends DataSourceKey> = {
	entries: DataSourceModel<K>[];
	pagination: {
		page: number;
		limit: number;
		total: number;
	};
};

export type FindFunctionType<K extends DataSourceKey> = (
	params: FindFunctionParamsType,
) => Promise<FindFunctionResponseType<K> | undefined>;

export type CreateFunctionType<K extends DataSourceKey> = (
	data: DataSourceFormValues<K>,
) => Promise<ResponseFetch<Partial<DataSourceModel<K>>>>;

export type UpdateFunctionType<K extends DataSourceKey> = (
	data: DataSourceFormValues<K>,
	id: number,
) => Promise<ResponseFetch<Partial<DataSourceModel<K>>>>;

export type DeleteFunctionType = (
	ids: number[],
) => Promise<ResponseFetch<null>>;

// ============================================================================
// DataTable Types
// ============================================================================

export type DataTableStateType<Filter> = {
	reloadTrigger: number; // Flag used to reload the data table entries
	first: number;
	rows: number;
	sortField: string;
	sortOrder: 1 | 0 | -1 | null | undefined;
	filters: Filter;
};

export type DataTableColumnType<Model> = {
	field: keyof Model & string;
	header: string;
	sortable?: boolean;
	body?: (
		rowData: Model,
		column: DataTableColumnType<Model>,
	) => React.JSX.Element | string;
	style?: React.CSSProperties;
};

export type DataTableSelectionModeType = 'checkbox' | 'multiple' | null;

export type DataTablePropsType = {
	dataKey: string;
	scrollHeight?: string;
};

// ============================================================================
// Action Types
// ============================================================================

export type DataTableActionType = 'view' | 'create' | 'update' | 'delete';
export type DataTableActionMode = 'form' | 'action' | 'other';
export type DataTableEntryRequirement = 'free' | 'single' | 'multiple';
export type DataTableActionPosition = 'left' | 'right' | 'hidden';

export type DataTableActionConfigType<F, K extends DataSourceKey> = {
	type?: DataTableActionType;
	mode: DataTableActionMode;
	permission: string;
	allowedEntries: DataTableEntryRequirement;
	customEntryCheck?: (entry: DataSourceModel<K>) => boolean;
	position: DataTableActionPosition;
	function?: F;
	button?: {
		className: string;
	};
};

export type DataTableActionsType<K extends DataSourceKey> = {
	[key: string]: DataTableActionConfigType<unknown, K>;
} & {
	create?: DataTableActionConfigType<CreateFunctionType<K>, K>;
	update?: DataTableActionConfigType<UpdateFunctionType<K>, K>;
	delete?: DataTableActionConfigType<DeleteFunctionType, K>;
};

// ============================================================================
// Form Types
// ============================================================================

export type FormManageType<K extends DataSourceKey> = {
	actionName: 'create' | 'update';
	formValues: DataSourceFormValues<K>;
	errors: Partial<Record<keyof DataSourceFormValues<K>, string[]>>;
	handleChange: (
		field: string,
		value: string | boolean | number | Date | null,
	) => void;
	pending: boolean;
};

export type FormStateType<K extends DataSourceKey> = {
	dataSource: K;
	id?: number;
	values: DataSourceFormValues<K>;
	errors: Partial<Record<keyof DataSourceFormValues<K>, string[]>>;
	message: string | null;
	situation: FormSituationType;
	resultData?: Partial<DataSourceModel<K>>;
};

export type ValidateFormFunctionType<K extends DataSourceKey> = (
	values: DataSourceFormValues<K>,
	id?: number,
) => ValidationReturnType<DataSourceFormValues<K>>;

// ============================================================================
// Configuration Types
// ============================================================================

export type DataSourceConfigType<K extends DataSourceKey> = {
	dataTableState: DataTableStateType<DataSourceTableFilter<K>>;
	dataTableColumns: DataTableColumnType<DataSourceModel<K>>[];
	formState?: FormStateType<K>;
	functions: {
		find: FindFunctionType<K>;
		onRowSelect?: (entry: DataSourceModel<K>) => void;
		onRowUnselect?: (entry: DataSourceModel<K>) => void;
		displayActionEntries?: (
			entries: DataSourceModel<K>[],
		) => Array<{ id: number; label: string }>;
	} & (DataSourceFormValues<K> extends never
		? object
		: {
				validateForm?: ValidateFormFunctionType<K>;
				getFormValues?: (formData: FormData) => DataSourceFormValues<K>;
				syncFormState?: (
					state: FormStateType<K>,
					model: DataSourceModel<K>,
				) => FormStateType<K>;
			});
	actions?: DataTableActionsType<K>;
};

// ============================================================================
// Configuration Registry
// ============================================================================

export const DataSourceConfig: {
	[K in DataSourceKey]: DataSourceConfigType<K>;
} = {
	cron_history: DataSourceConfigCronHistory,
	log_data: DataSourceConfigLogData,
	log_history: DataSourceConfigLogHistory,
	mail_queue: DataSourceConfigMailQueue,
	permissions: DataSourceConfigPermissions,
	templates: DataSourceConfigTemplates,
	users: DataSourceConfigUsers,
};

// ============================================================================
// Utility Functions
// ============================================================================

export function getDataSourceConfig<
	K extends DataSourceKey,
	P extends keyof DataSourceConfigType<K>,
>(dataSource: K, prop: P): DataSourceConfigType<K>[P] {
	return DataSourceConfig[dataSource][prop];
}
