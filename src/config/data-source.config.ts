import type React from 'react';
import type { JSX } from 'react';
import type {
	ActionEventType,
	ActionOperationMultipleFunctionType,
	ActionOperationSingleFunctionType,
	CreateFunctionType,
	DisplayEntryLabelFnType,
	EntriesSelectionType,
	FindFunctionType,
	OperationFunctionType,
	PrepareEntryFnType,
	ReloadEntryFnType,
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

export type DataTableColumnType<Entry> = {
	field: string;
	header: string;
	sortable?: boolean;
	body?: (
		entry: Entry,
		column: DataTableColumnType<Entry>,
	) => JSX.Element | string;
	style?: React.CSSProperties;
};

export type DataTableValueOptionsType<Entry> = {
	customValue?: string | JSX.Element;
	capitalize?: boolean;
	markDeleted?: boolean;
	isStatus?: boolean;
	displayDate?: boolean;
	displayButton?: {
		action: string | ((entry: Entry) => string | undefined);
		dataSource: DataSourceKey;
		altTitle?: string;
		alternateEntryId?: number;
	};
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
	reloadEntry?: ReloadEntryFnType<Entry>; // Used to reload entry data for form and view; the entry passed from the list may not have all the data
	prepareEntry?: PrepareEntryFnType<Entry>; // Prepare entry before passing to renderer; Note: this run after reloadEntry if present

	// Form-related
	validateForm?: ValidateFormFnType<FormValues>;
	getFormValues?: GetFormValuesFnType<FormValues>;
	getFormState?: GetFormStateFnType<FormValues, Entry>;

	events?: Partial<Record<'success' | 'error', ActionEventType<Entry>>>;
};

// Each variant enforces the valid windowType <-> entriesSelection correlation
type FormCreateActionConfig<
	Entry extends WindowEntryType,
	FormValues extends FormValuesType,
> = ActionConfigBase<Entry, FormValues> & {
	windowType: 'form';
	entriesSelection: 'free';
	operationFunction: CreateFunctionType<Entry, FormValues>;
	validateForm: ValidateFormFnType<FormValues>;
	getFormValues: GetFormValuesFnType<FormValues>;
	getFormState: GetFormStateFnType<FormValues, Entry>;
};

type FormUpdateActionConfig<
	Entry extends WindowEntryType,
	FormValues extends FormValuesType,
> = ActionConfigBase<Entry, FormValues> & {
	windowType: 'form';
	entriesSelection: 'single';
	operationFunction: UpdateFunctionType<Entry, FormValues>;
	validateForm: ValidateFormFnType<FormValues>;
	getFormValues: GetFormValuesFnType<FormValues>;
	getFormState: GetFormStateFnType<FormValues, Entry>;
	reloadEntry?: ReloadEntryFnType<Entry>;
};

type SingleActionConfig<
	Entry extends WindowEntryType,
	FormValues extends FormValuesType,
> = ActionConfigBase<Entry, FormValues> & {
	windowType: 'action';
	entriesSelection: 'single';
	operationFunction: ActionOperationSingleFunctionType<Entry>;
};

type MultipleActionConfig<
	Entry extends WindowEntryType,
	FormValues extends FormValuesType,
> = ActionConfigBase<Entry, FormValues> & {
	windowType: 'action';
	entriesSelection: 'multiple';
	operationFunction: ActionOperationMultipleFunctionType;
};

type ViewActionConfig<
	Entry extends WindowEntryType,
	FormValues extends FormValuesType,
> = ActionConfigBase<Entry, FormValues> & {
	windowType: 'view';
	entriesSelection: 'single';
	operationFunction?: never;
	reloadEntry?: ReloadEntryFnType<Entry>;
};

type OtherActionConfig<
	Entry extends WindowEntryType,
	FormValues extends FormValuesType,
> = ActionConfigBase<Entry, FormValues> & {
	windowType: 'other';
	entriesSelection: EntriesSelectionType;
	operationFunction?: never;
};

export type ActionConfigType<
	Entry extends WindowEntryType = WindowEntryType,
	FormValues extends FormValuesType = FormValuesType,
> =
	| FormCreateActionConfig<Entry, FormValues>
	| FormUpdateActionConfig<Entry, FormValues>
	| SingleActionConfig<Entry, FormValues>
	| MultipleActionConfig<Entry, FormValues>
	| ViewActionConfig<Entry, FormValues>
	| OtherActionConfig<Entry, FormValues>;

export type ActionsType<
	Entry extends WindowEntryType,
	FormValues extends FormValuesType = FormValuesType,
> = {
	[key: string]: ActionConfigType<Entry, FormValues>;
} & {
	create?: FormCreateActionConfig<Entry, FormValues>;
	update?: FormUpdateActionConfig<Entry, FormValues>;
	delete?:
		| SingleActionConfig<Entry, FormValues>
		| MultipleActionConfig<Entry, FormValues>;
	restore?:
		| SingleActionConfig<Entry, FormValues>
		| MultipleActionConfig<Entry, FormValues>;
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
	| 'users'

	| 'vehicles'
	| 'company-vehicles'
	| 'cmrs'
	| 'cmr-drivers'
	| 'cmr-vehicles'
	| 'operational-records'
	| 'work-sessions'
	| 'work-session-vehicles';

export type DataSourceConfigType<
	Entry extends WindowEntryType,
	FormValues extends FormValuesType = FormValuesType,
> = {
	dataTable: {
		state: DataTableStateType;
		columns: DataTableColumnType<Entry>[];
		find: FindFunctionType<Entry>;
		onRowSelect?: (entry: Entry) => void;
		onRowUnselect?: (entry: Entry) => void;
	};
	displayEntryLabel?: DisplayEntryLabelFnType<Entry>;
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
