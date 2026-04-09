import type { ModalSizeType } from '@/components/ui/modal';
import type { OperationFunctionType } from '@/types/action-function.type';
import type {
	FormEventType,
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
export type WindowSectionType = 'dashboard' | 'public';
export type WindowInstanceType = 'form' | 'action' | 'view' | 'other';

export type WindowDefinition<
	FormValues extends FormValuesType = FormValuesType,
	Entry extends WindowEntryType = WindowEntryType,
> = {
	windowType?: WindowInstanceType;
	windowComponent?: WindowComponent;
	entriesSelection: 'free' | 'single' | 'multiple';
	operationFunction?: OperationFunctionType<Entry, FormValues>;
	button?: ActionButtonPropsType;
	validateForm?: ValidateFormFnType<FormValues>;
	getFormValues?: GetFormValuesFnType<FormValues>;
	getFormState?: GetFormStateFnType<FormValues, Entry>;
};

// biome-ignore lint/suspicious/noExplicitAny: It's fine
export type WindowComponent = React.ComponentType<any>;

export type WindowConfig<
	FormValues extends FormValuesType = FormValuesType,
	Entry extends WindowEntryType = WindowEntryType,
> = {
	uid: string;
	section: WindowSectionType;
	key: string;
	action: string;
	definition: WindowDefinition<FormValues, Entry>;
	minimized: boolean;
	data?: {
		entries?: Entry[];
		prefillEntry?: Entry; // TODO: maybe drop this
	};
	events?: Record<string, FormEventType<unknown>>;
	props?: WindowConfigPropsType;
};

export type WindowCreateConfig = Omit<WindowConfig, 'minimized' | 'definition'>;
