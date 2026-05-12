import type React from 'react';
import type { ModalSizeType } from '@/components/ui/modal';
import type {
	ActionEventType,
	DisplayEntryLabelFnType,
	EntriesSelectionType,
	OperationFunctionType,
	PrepareEntryFnType,
	ReloadEntryFnType,
} from '@/types/action.type';
import type { DataSourceSection } from '@/types/data-source.type';
import type {
	FormValuesType,
	GetFormStateFnType,
	GetFormValuesFnType,
	ValidateFormFnType,
} from '@/types/form.type';
import type { ActionButtonPropsType } from '@/types/html.type';

export type WindowEntryType = Record<string, unknown>;
export type WindowConfigPropsType = {
	title?: string;
	size?: ModalSizeType;
	className?: string;
};
export type WindowType<T extends EntriesSelectionType> = T extends 'free'
	? 'form' | 'other'
	: T extends 'single'
		? 'view' | 'action' | 'other'
		: T extends 'multiple'
			? 'view' | 'action' | 'other'
			: never;

type AllowedDisplayEntryLabel<
	T extends EntriesSelectionType,
	Entry,
> = T extends 'single' ? DisplayEntryLabelFnType<Entry> : never;

export type WindowDefinition<
	FormValues extends FormValuesType = FormValuesType,
	Entry extends WindowEntryType = WindowEntryType,
	T extends EntriesSelectionType = EntriesSelectionType,
	Params extends Record<string, unknown> = Record<string, unknown>,
> = {
	entriesSelection: T;
	windowType?: WindowType<T>;
	windowTitle?: string;
	windowComponent?: WindowComponent;
	operationFunction?: OperationFunctionType<Entry, Params>;
	button?: ActionButtonPropsType;
	validateForm?: ValidateFormFnType<FormValues>;
	getFormValues?: GetFormValuesFnType<FormValues>;
	getFormState?: GetFormStateFnType<FormValues, Entry>;
	displayEntryLabel?: AllowedDisplayEntryLabel<T, Entry>;
	reloadEntry?: ReloadEntryFnType<Entry>;
	prepareEntry?: PrepareEntryFnType<Entry>;
};

// biome-ignore lint/suspicious/noExplicitAny: It's fine
export type WindowComponent = React.ComponentType<any>;

export type WindowConfig<
	FormValues extends FormValuesType = FormValuesType,
	Entry extends WindowEntryType = WindowEntryType,
> = {
	uid: string;
	section: DataSourceSection;
	dataSource: string;
	action: string;
	minimized: boolean;
	definition: WindowDefinition<FormValues, Entry>;
	data?: {
		entries?: Entry[];
		prefillEntry?: Partial<FormValues>;
	};
	events?: Record<string, ActionEventType<Entry>>;
	props?: WindowConfigPropsType;
};

export type WindowCreateConfig<
	FormValues extends FormValuesType,
	Entry extends WindowEntryType,
> = Omit<WindowConfig<FormValuesType, Entry>, 'uid' | 'definition'> & {
	uid?: string;
	definition?: Partial<WindowDefinition<FormValues, Entry>>;
};
