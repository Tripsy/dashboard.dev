import type React from 'react';
import type { JSX } from 'react';
import type { ModalSizeType } from '@/components/ui/modal';
import type {
	PermissionEntityType,
	PermissionOperationType,
} from '@/models/permission.model';
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
import type { DataSourceKey } from '@/types/data-source.key';
import type {
	FormValuesType,
	GetFormStateFnType,
	GetFormValuesFnType,
	ValidateFormFnType,
} from '@/types/form.type';
import type { ActionButtonPropsType } from '@/types/html.type';

export const DataSourceSectionEnum = {
	DASHBOARD: 'dashboard',
	PUBLIC: 'public',
} as const;

export type DataSourceSection =
	(typeof DataSourceSectionEnum)[keyof typeof DataSourceSectionEnum];

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
	dataSourceKey?: DataSourceKey;
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

export type ActionConfigPermission = [
	PermissionEntityType,
	PermissionOperationType,
];

type ActionConfigBase<Entry, FormValues extends FormValuesType> = {
	windowTitle: string;
	// biome-ignore lint/suspicious/noExplicitAny: It's fine
	windowComponent?: React.ComponentType<any>; // e.g: ViewUser, FormManageUser, SetupPermissionsUser, etc.
	windowConfigProps?: {
		title?: string;
		size?: ModalSizeType;
		className?: string;
	};

	permission: ActionConfigPermission;
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
	Entry,
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
	Entry,
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
	Entry,
	FormValues extends FormValuesType,
> = ActionConfigBase<Entry, FormValues> & {
	windowType: 'action';
	entriesSelection: 'single';
	operationFunction: ActionOperationSingleFunctionType<Entry>;
};

type MultipleActionConfig<
	Entry,
	FormValues extends FormValuesType,
> = ActionConfigBase<Entry, FormValues> & {
	windowType: 'action';
	entriesSelection: 'multiple';
	operationFunction: ActionOperationMultipleFunctionType;
};

type ViewActionConfig<
	Entry,
	FormValues extends FormValuesType,
> = ActionConfigBase<Entry, FormValues> & {
	windowType: 'view';
	entriesSelection: 'single';
	operationFunction?: never;
	reloadEntry?: ReloadEntryFnType<Entry>;
};

type OtherActionConfig<
	Entry,
	FormValues extends FormValuesType,
> = ActionConfigBase<Entry, FormValues> & {
	windowType: 'other';
	entriesSelection: EntriesSelectionType;
	operationFunction?: never;
};

export type ActionConfigType<
	Entry,
	FormValues extends FormValuesType = FormValuesType,
	ValidatedValues = FormValues,
> =
	| FormCreateActionConfig<Entry, FormValues, ValidatedValues>
	| FormUpdateActionConfig<Entry, FormValues, ValidatedValues>
	| SingleActionConfig<Entry, FormValues>
	| MultipleActionConfig<Entry, FormValues>
	| ViewActionConfig<Entry, FormValues>
	| OtherActionConfig<Entry, FormValues>;

export type ActionsType<Entry> = {
	// biome-ignore lint/suspicious/noExplicitAny: It's fine
	[key: string]: ActionConfigType<Entry, any, any>;
} & {
	// biome-ignore lint/suspicious/noExplicitAny: It's fine
	create?: FormCreateActionConfig<Entry, any, any>;
	// biome-ignore lint/suspicious/noExplicitAny: It's fine
	update?: FormUpdateActionConfig<Entry, any, any>;
	// biome-ignore lint/suspicious/noExplicitAny: It's fine
	delete?: SingleActionConfig<Entry, any> | MultipleActionConfig<Entry, any>;
	// biome-ignore lint/suspicious/noExplicitAny: It's fine
	restore?: SingleActionConfig<Entry, any> | MultipleActionConfig<Entry, any>;
};

export type DataSourceConfigType<Entry> = {
	dataTable?: {
		state: DataTableStateType;
		columns: DataTableColumnType<Entry>[];
		find: FindFunctionType<Entry>;
		onRowSelect?: (entry: Entry) => void;
		onRowUnselect?: (entry: Entry) => void;
	};
	displayEntryLabel?: DisplayEntryLabelFnType<Entry>;
	actions?: ActionsType<Entry>;
};
