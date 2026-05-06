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

	permission: string; // Related to auth policy (e.g.: 'user.create')
	customEntryCheck?: (entry: Entry) => boolean; // Additional function to check if the action is available (hint: active user cannot have `active` action)
	buttonPosition: 'left' | 'right' | 'hidden'; // Describe where the action button should be placed in data-table
	button?: ActionButtonPropsType; // Action button configuration

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
	ValidatedValues = FormValues,
> = ActionConfigBase<Entry, FormValues> & {
	windowType: 'form';
	entriesSelection: 'free';
	operationFunction: CreateFunctionType<Entry, ValidatedValues>;
	validateForm: ValidateFormFnType<FormValues>;
	getFormValues: GetFormValuesFnType<FormValues>;
	getFormState: GetFormStateFnType<FormValues, Entry>;
};

type FormUpdateActionConfig<
	Entry extends WindowEntryType,
	FormValues extends FormValuesType,
	ValidatedValues = FormValues,
> = ActionConfigBase<Entry, FormValues> & {
	windowType: 'form';
	entriesSelection: 'single';
	operationFunction: UpdateFunctionType<Entry, ValidatedValues>;
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
	ValidatedValues = FormValues,
> =
	| FormCreateActionConfig<Entry, FormValues, ValidatedValues>
	| FormUpdateActionConfig<Entry, FormValues, ValidatedValues>
	| SingleActionConfig<Entry, FormValues>
	| MultipleActionConfig<Entry, FormValues>
	| ViewActionConfig<Entry, FormValues>
	| OtherActionConfig<Entry, FormValues>;

export type ActionsType<
	Entry extends WindowEntryType,
	FormValues extends FormValuesType = FormValuesType,
	ValidatedValues = FormValues,
> = {
	[key: string]: ActionConfigType<Entry, FormValues, ValidatedValues>;
} & {
	create?: FormCreateActionConfig<Entry, FormValues, ValidatedValues>;
	update?: FormUpdateActionConfig<Entry, FormValues, ValidatedValues>;
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

export const DataSourceSectionEnum = {
	DASHBOARD: 'dashboard',
	PUBLIC: 'public',
} as const;

export type DataSourceSection =
	(typeof DataSourceSectionEnum)[keyof typeof DataSourceSectionEnum];

export type DataSourceKey =
	| 'brand'
	| 'cash-flow'
	| 'client-address'
	| 'client'
	| 'cron-history'
	| 'log-data'
	| 'log-history'
	| 'mail-queue'
	| 'permission'
	| 'place'
	| 'template'
	| 'user'
	| 'vehicle'
	| 'company-vehicle'
	| 'cmr'
	| 'cmr-driver'
	| 'cmr-vehicle'
	| 'operational-record'
	| 'work-session'
	| 'work-session-vehicle';

export type DataSourceConfigType<
	Entry extends WindowEntryType,
	FormValues extends FormValuesType = FormValuesType,
	ValidatedValues = FormValues,
> = {
	dataTable: {
		state: DataTableStateType;
		columns: DataTableColumnType<Entry>[];
		find: FindFunctionType<Entry>;
		onRowSelect?: (entry: Entry) => void;
		onRowUnselect?: (entry: Entry) => void;
	};
	displayEntryLabel?: DisplayEntryLabelFnType<Entry>;
	actions?: ActionsType<Entry, FormValues, ValidatedValues>;
};

const registry: Record<
	DataSourceSection,
	// biome-ignore lint/suspicious/noExplicitAny: It's fine
	Partial<Record<DataSourceKey, DataSourceConfigType<any, any, any>>>
> = {
	dashboard: {},
	public: {},
};

export function loadDataSource(
	section: DataSourceSection,
	key: DataSourceKey,
	// biome-ignore lint/suspicious/noExplicitAny: It's fine
	config: DataSourceConfigType<any, any, any>,
) {
	if (hasDataSourceConfig(section, key)) {
		return;
	}

	registry[section][key] = config;
}

export function hasDataSourceConfig<K extends DataSourceKey>(
	section: DataSourceSection,
	key: K,
): boolean {
	return !!registry[section][key];
}

export function getDataSourceConfig<
	K extends DataSourceKey,
	// biome-ignore lint/suspicious/noExplicitAny: It's fine
	P extends keyof DataSourceConfigType<any, any, any>,
>(
	section: DataSourceSection,
	key: K,
	prop: P,
): // biome-ignore lint/suspicious/noExplicitAny: It's fine
DataSourceConfigType<any, any, any>[P] {
	const config = registry[section][key];

	if (!config) {
		throw new Error(
			`DataSource "${key}" is not registered for section "${section}"`,
		);
	}

	return config[prop];
}

export function resolveRequestPath(key: DataSourceKey) {
	const withSuffixList: DataSourceKey[] = [
		'brand',
		'client',
		'permission',
		'place',
		'template',
		'user',
		'vehicle',
		'company-vehicle',
		'cmr',
		'cmr-driver',
		'cmr-vehicle',
		'operational-record',
		'work-session',
		'work-session-vehicle',
	];

	if (withSuffixList.includes(key)) {
		return `${key}s`;
	}

	return key;
}
