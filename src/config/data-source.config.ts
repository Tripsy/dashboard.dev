import type React from 'react';
import type { DataTableColumnType } from '@/app/(dashboard)/_components/data-table-value';
import type {
	ActionEventType,
	CreateFunctionType,
	DeleteFunctionType,
	DisplayEntryLabelFnType,
	EntriesSelectionType,
	FindFunctionType,
	OperationFunctionType,
	RestoreFunctionType,
	UpdateFunctionType,
} from '@/types/action.type';
import type {
	FormValuesType,
	GetFormStateFnType,
	GetFormValuesFnType,
	ValidateFormFnType,
} from '@/types/form.type';
import type { ActionButtonPropsType } from '@/types/html.type';
import type {
	WindowConfigPropsType,
	WindowEntryType,
} from '@/types/window.type';

// ============================================================================
// Data Table Types
// ============================================================================

export type DataTableSelectionModeType = 'checkbox' | 'multiple' | null;

export type DataTableCustomEntrySelectedType<Entry> = (
	entry: Entry,
) => Promise<Entry | null>;

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

// ============================================================================
// Action Types
// ============================================================================

type ActionConfigBase<
	Entry extends WindowEntryType,
	FormValues extends FormValuesType,
> = {
	windowTitle: string;
	// biome-ignore lint/suspicious/noExplicitAny: It's fine
	windowComponent?: React.ComponentType<any>; // e.g: ViewUser, FormManageUser, SetupPermissionsUser, etc.
	windowConfigProps?: WindowConfigPropsType;

	permission: string; // Related to auth policy (e.g.: 'users.create')
	customEntryCheck?: (entry: Entry) => boolean; // Additional function to check if the action is available (hint: active users cannot have `active` action)
	buttonPosition: 'left' | 'right' | 'hidden'; // Describe where the action button should be placed in data-table
	button?: ActionButtonPropsType; // Action button configuration

	operationFunction?: OperationFunctionType<Entry, FormValues>; // e.g: createUser, updateUser, etc.

	// Form-related
	validateForm?: ValidateFormFnType<FormValues>;
	getFormValues?: GetFormValuesFnType<FormValues>;
	getFormState?: GetFormStateFnType<FormValues, Entry>;

	events?: Record<string, ActionEventType<Entry>>;

	customEntrySelected?: DataTableCustomEntrySelectedType<Entry>; // Custom function which allows to derive a new entry from the selected one (hint: viewUser)
};

// Each variant enforces the valid windowType <-> entriesSelection correlation
type FormActionConfig<
	Entry extends WindowEntryType,
	FormValues extends FormValuesType,
> = ActionConfigBase<Entry, FormValues> & {
	windowType: 'form';
	entriesSelection: 'free' | 'single'; // form can only be free (create) or single (update)
};

type ActionWindowConfig<
	Entry extends WindowEntryType,
	FormValues extends FormValuesType,
> = ActionConfigBase<Entry, FormValues> & {
	windowType: 'action';
	entriesSelection: 'single' | 'multiple';
};

type ViewActionConfig<
	Entry extends WindowEntryType,
	FormValues extends FormValuesType,
> = ActionConfigBase<Entry, FormValues> & {
	windowType: 'view';
	entriesSelection: 'single';
};

type OtherActionConfig<
	Entry extends WindowEntryType,
	FormValues extends FormValuesType,
> = ActionConfigBase<Entry, FormValues> & {
	windowType: 'other';
	entriesSelection: EntriesSelectionType;
};

export type ActionConfigType<
	Entry extends WindowEntryType = WindowEntryType,
	FormValues extends FormValuesType = FormValuesType,
> =
	| FormActionConfig<Entry, FormValues>
	| ActionWindowConfig<Entry, FormValues>
	| ViewActionConfig<Entry, FormValues>
	| OtherActionConfig<Entry, FormValues>;

type TypedActionConfigType<
	Entry extends WindowEntryType,
	FormValues extends FormValuesType,
	Fn,
> = ActionConfigType<Entry, FormValues> & {
	operationFunction?: Fn;
};

type ActionsType<
	Entry extends WindowEntryType,
	FormValues extends FormValuesType = FormValuesType,
> = {
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
	Entry extends WindowEntryType,
	FormValues extends FormValuesType,
> = {
	dataTable: {
		state: DataTableStateType;
		columns: DataTableColumnType<Entry>[];
		find: FindFunctionType<Entry>;
		onRowSelect?: (entry: Entry) => void;
		onRowUnselect?: (entry: Entry) => void;
	};
	displayEntryLabel?: DisplayEntryLabelFnType<Entry>;
	// formState?: FormStateType<FormValues>;
	actions?: ActionsType<Entry, FormValues>;
};

const registry: Partial<
	// biome-ignore lint/suspicious/noExplicitAny: It's fine
	Record<DataSourceKey, DataSourceConfigType<any, any>>
> = {};

export function registerDataSource<
	K extends DataSourceKey,
	Entry extends WindowEntryType,
	FormValues extends FormValuesType,
>(key: K, config: DataSourceConfigType<Entry, FormValues>) {
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
