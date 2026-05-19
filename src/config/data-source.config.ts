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
import {
	type DataSourceSection,
	DataSourceSectionEnum,
} from '@/types/data-source.type';
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

const LOADERS: Record<
	DataSourceSection,
	// biome-ignore lint/suspicious/noExplicitAny: It's fine
	Partial<Record<string, () => Promise<DataSourceConfigType<any>>>>
> = {
	[DataSourceSectionEnum.DASHBOARD]: {
		address: () =>
			import(
				'@/app/(dashboard)/dashboard/address/address.definition'
			).then((m) => m.dataSourceConfigAddress),
		brand: () =>
			import('@/app/(dashboard)/dashboard/brand/brand.definition').then(
				(m) => m.dataSourceConfigBrand,
			),
		'cash-flow': () =>
			import(
				'@/app/(dashboard)/dashboard/cash-flow/cash-flow.definition'
			).then((m) => m.dataSourceConfigCashFlow),
		client: () =>
			import('@/app/(dashboard)/dashboard/client/client.definition').then(
				(m) => m.dataSourceConfigClient,
			),
		cmr: () =>
			import('@/app/(dashboard)/dashboard/cmr/cmr.definition').then(
				(m) => m.dataSourceConfigCmr,
			),
		'cmr-session': () =>
			import(
				'@/app/(dashboard)/dashboard/cmr-session/cmr-session.definition'
			).then((m) => m.dataSourceConfigCmrSession),
		'cmr-vehicle': () =>
			import(
				'@/app/(dashboard)/dashboard/cmr-vehicle/cmr-vehicle.definition'
			).then((m) => m.dataSourceConfigCmrVehicle),
		'company-vehicle': () =>
			import(
				'@/app/(dashboard)/dashboard/company-vehicle/company-vehicle.definition'
			).then((m) => m.dataSourceConfigCompanyVehicle),
		'cron-history': () =>
			import(
				'@/app/(dashboard)/dashboard/cron-history/cron-history.definition'
			).then((m) => m.dataSourceConfigCronHistory),
		'log-data': () =>
			import(
				'@/app/(dashboard)/dashboard/log-data/log-data.definition'
			).then((m) => m.dataSourceConfigLogData),
		'log-history': () =>
			import(
				'@/app/(dashboard)/dashboard/log-history/log-history.definition'
			).then((m) => m.dataSourceConfigLogHistory),
		'mail-queue': () =>
			import(
				'@/app/(dashboard)/dashboard/mail-queue/mail-queue.definition'
			).then((m) => m.dataSourceConfigMailQueue),
		permission: () =>
			import(
				'@/app/(dashboard)/dashboard/permission/permission.definition'
			).then((m) => m.dataSourceConfigPermission),
		place: () =>
			import('@/app/(dashboard)/dashboard/place/place.definition').then(
				(m) => m.dataSourceConfigPlace,
			),
		template: () =>
			import(
				'@/app/(dashboard)/dashboard/template/template.definition'
			).then((m) => m.dataSourceConfigTemplate),
		user: () =>
			import('@/app/(dashboard)/dashboard/user/user.definition').then(
				(m) => m.dataSourceConfigUser,
			),
		vehicle: () =>
			import(
				'@/app/(dashboard)/dashboard/vehicle/vehicle.definition'
			).then((m) => m.dataSourceConfigVehicle),
		'work-session': () =>
			import(
				'@/app/(dashboard)/dashboard/work-session/work-session.definition'
			).then((m) => m.dataSourceConfigWorkSession),
		'work-session-vehicle': () =>
			import(
				'@/app/(dashboard)/dashboard/work-session-vehicle/work-session-vehicle.definition'
			).then((m) => m.dataSourceConfigWorkSessionVehicle),
	},
	[DataSourceSectionEnum.PUBLIC]: {
		address: () =>
			import(
				'@/app/(public)/_components/address/address.definition'
			).then((m) => m.dataSourceConfigAddress),
		client: () =>
			import('@/app/(public)/_components/client/client.definition').then(
				(m) => m.dataSourceConfigClient,
			),
		cmr: () =>
			import('@/app/(public)/_components/cmr/cmr.definition').then(
				(m) => m.dataSourceConfigCmr,
			),
		'cmr-session': () =>
			import(
				'@/app/(public)/_components/cmr-session/cmr-session.definition'
			).then((m) => m.dataSourceConfigCmrSession),
		'cmr-vehicle': () =>
			import(
				'@/app/(public)/_components/cmr-vehicle/cmr-vehicle.definition'
			).then((m) => m.dataSourceConfigCmrVehicle),
		'work-session': () =>
			import(
				'@/app/(public)/_components/work-session/work-session.definition'
			).then((m) => m.dataSourceConfigWorkSession),
		'work-session-vehicle': () =>
			import(
				'@/app/(public)/_components/work-session-vehicle/work-session-vehicle.definition'
			).then((m) => m.dataSourceConfigWorkSessionVehicle),
	},
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

export type ActionsType<Entry extends WindowEntryType> = {
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

// ============================================================================
// Data Source
// ============================================================================

type DashboardKeys =
	keyof (typeof LOADERS)[typeof DataSourceSectionEnum.DASHBOARD];
type PublicKeys = keyof (typeof LOADERS)[typeof DataSourceSectionEnum.PUBLIC];

export type DataSourceKey = DashboardKeys | PublicKeys;

export type DataSourceConfigType<Entry extends WindowEntryType> = {
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

const registry: Record<
	DataSourceSection,
	// biome-ignore lint/suspicious/noExplicitAny: It's fine
	Partial<Record<DataSourceKey, DataSourceConfigType<any>>>
> = {
	dashboard: {},
	public: {},
};

export async function getDataSourceConfig<
	K extends DataSourceKey,
	// biome-ignore lint/suspicious/noExplicitAny: It's fine
	P extends keyof DataSourceConfigType<any>,
>(
	section: DataSourceSection,
	key: K,
	prop: P,
): Promise<
	// biome-ignore lint/suspicious/noExplicitAny: It's fine
	DataSourceConfigType<any>[P]
> {
	if (!registry[section]?.[key]) {
		const loader = LOADERS[section]?.[key];

		if (!loader) {
			throw new Error(
				`No loader found for "${key}" in section "${section}"`,
			);
		}

		registry[section][key] = await loader();
	}

	return registry[section][key][prop];
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
		'cmr-session',
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
