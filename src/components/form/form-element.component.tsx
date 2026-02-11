import { Calendar, CalendarIcon } from 'lucide-react';
import {
	AutoComplete,
	type AutoCompleteCompleteEvent,
} from 'primereact/autocomplete';
import type { DropdownChangeEvent } from 'primereact/dropdown';
import React, { type JSX, useMemo } from 'react';
import { FormElementError } from '@/components/form/form-element-error.component';
import { Icons } from '@/components/icon.component';
import { LoadingIcon } from '@/components/status.component';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { FilterValueType } from '@/config/data-source.config';
import { cn } from '@/helpers/css.helper';
import { formatDate } from '@/helpers/date.helper';
import { useTranslation } from '@/hooks/use-translation.hook';

export type InputValueType = string | number | null;
export type OptionValueType = string | null;
export type CheckboxValueType = boolean;

export const FormElement = ({
	children,
	className,
	label,
	error,
}: {
	children: JSX.Element;
	className?: string;
	label?: { text: string; for?: string; required?: boolean };
	error?: string[];
}): JSX.Element | null => (
	<div className={cn('form-element', className)}>
		{label &&
			(label.for ? (
				<Label htmlFor={label.for}>
					{label.text}
					{label.required && (
						<span className="text-error ml-1">*</span>
					)}
				</Label>
			) : (
				<div className="label-placeholder">
					{label.text}
					{label.required && (
						<span className="text-error ml-1">*</span>
					)}
				</div>
			))}
		<div>
			{children}
			{error && <FormElementError messages={error} />}
		</div>
	</div>
);

export const FormElementWrapper = ({
	children,
	className,
}: {
	children: JSX.Element;
	className?: string;
}): JSX.Element | null => (
	<div className={cn('form-element-wrapper', className)}>{children}</div>
);

export const FormElementIcon = ({
	children,
	className,
	position = 'left',
}: {
	children: JSX.Element;
	className?: string;
	position?: 'left' | 'right';
}): JSX.Element | null => (
	<div
		className={cn(
			'form-element-icon',
			position === 'left'
				? 'form-element-icon-left'
				: 'form-element-icon-right',
			className,
		)}
	>
		{children}
	</div>
);

const stateConfig = {
	default: {
		borderClass: '',
	},
	success: {
		borderClass: 'border border-success focus-visible:ring-success',
	},
	error: {
		borderClass: 'border border-error focus-visible:ring-error',
	},
	warning: {
		borderClass: 'border border-warning focus-visible:ring-warning',
	},
};

const useFieldState = ({
	value,
	error,
}: {
	value?: FilterValueType;
	error?: string[];
}) => {
	if (error?.length) {
		return stateConfig.error;
	}

	if (value !== null && value !== undefined && value !== '') {
		return stateConfig.success;
	}

	return stateConfig.default;
};

export type OptionsType<TValue extends string = string> = {
	label: string;
	value: TValue;
}[];

export type FormComponentProps<TValue> = {
	id: string;
	labelText: string;
	fieldType?: 'text' | 'password' | 'email' | 'number';
	fieldName: string;
	fieldValue: TValue;
	isRequired?: boolean;
	className?: string;
	placeholderText?: string;
	disabled: boolean;
	autoComplete?:
		| 'current-password'
		| 'new-password'
		| 'name'
		| 'email'
		| 'organization';
	onChange: React.ChangeEventHandler<HTMLInputElement>;
	error?: string[];
	icons?: { left?: JSX.Element; right?: JSX.Element };
};

/** Standard form elements **/

export const FormComponentInput = <TValue extends InputValueType>({
	labelText,
	id,
	fieldType = 'text',
	fieldName,
	fieldValue,
	isRequired = false,
	className = 'w-full',
	placeholderText,
	disabled,
	autoComplete,
	onChange,
	error,
	icons,
}: FormComponentProps<TValue>) => {
	const { borderClass } = useFieldState({ value: fieldValue, error });

	return (
		<FormElement
			label={{ for: id, text: labelText, required: isRequired }}
			error={error}
		>
			<FormElementWrapper>
				<>
					{icons?.left && (
						<FormElementIcon position="left">
							{icons.left}
						</FormElementIcon>
					)}

					<Input
						type={fieldType}
						id={id}
						name={fieldName}
						value={fieldValue ?? ''}
						className={cn(borderClass, className)}
						placeholder={placeholderText}
						autoComplete={autoComplete}
						disabled={disabled}
						aria-invalid={!!error}
						onChange={onChange}
					/>

					{icons?.right && (
						<FormElementIcon position="right">
							{icons.right}
						</FormElementIcon>
					)}
				</>
			</FormElementWrapper>
		</FormElement>
	);
};

export const FormComponentSelect = <TValue extends OptionValueType>({
	labelText,
	id,
	fieldName,
	fieldValue,
	isRequired = false,
	className,
	placeholderText = '-select-',
	disabled,
	error,
	options,
	onValueChange,
}: Omit<FormComponentProps<TValue>, 'autoComplete' | 'icons' | 'onChange'> & {
	options: OptionsType;
	onValueChange: (value: string) => void;
}) => {
	const { borderClass } = useFieldState({ value: fieldValue, error });

	return (
		<FormElement
			label={{ for: id, text: labelText, required: isRequired }}
			error={error}
		>
			<>
				<input
					type="hidden"
					name={fieldName}
					value={fieldValue ?? ''}
				/>

				<Select
					value={fieldValue ?? ''}
					onValueChange={onValueChange}
					disabled={disabled}
				>
					<SelectTrigger
						id={id}
						className={cn(borderClass, className)}
					>
						<SelectValue placeholder={placeholderText} />
					</SelectTrigger>
					<SelectContent>
						{options.map(({ label, value }) => {
							const key = `${id}-${value}`;

							return (
								<SelectItem key={key} value={value}>
									{label}
								</SelectItem>
							);
						})}
					</SelectContent>
				</Select>
			</>
		</FormElement>
	);
};

export const FormComponentCheckbox = <TValue extends CheckboxValueType>({
	children,
	id,
	fieldName,
	checked,
	className,
	disabled,
	error,
	onCheckedChange,
}: Omit<
	FormComponentProps<TValue>,
	| 'labelText'
	| 'fieldType'
	| 'fieldValue'
	| 'isRequired'
	| 'placeholderText'
	| 'autoComplete'
	| 'icons'
	| 'onChange'
> & {
	checked: boolean;
	onCheckedChange: (checked: boolean) => void;
	children: JSX.Element | string;
}) => {
	const { borderClass } = useFieldState({ value: checked, error });

	return (
		<FormElement error={error}>
			<Label
				htmlFor={id}
				className="flex items-center gap-2"
			>
				<Checkbox
					id={id}
					name={fieldName}
					disabled={disabled}
					aria-invalid={!!error}
					checked={checked}
					onCheckedChange={onCheckedChange}
					className={cn(borderClass, className)}
				/>
				{children}
			</Label>
		</FormElement>
	);
};

export const FormComponentRadio = <TValue extends OptionValueType>({
	labelText,
	id,
	fieldName,
	fieldValue,
	isRequired,
	className = 'flex flex-wrap gap-4',
	disabled,
	error,
	options,
	onValueChange,
}: Omit<
	FormComponentProps<TValue>,
	'fieldType' | 'onChange' | 'placeholderText' | 'autoComplete' | 'icons'
> & {
	options: OptionsType;
	onValueChange: (value: string) => void;
}) => (
	<FormElement
		label={{ text: labelText, required: isRequired }}
		error={error}
	>
		<>
			<input type="hidden" name={fieldName} value={fieldValue ?? ''} />

			<RadioGroup
				value={fieldValue}
				onValueChange={onValueChange}
				className={className}
				disabled={disabled}
			>
				{options.map(({ label, value }) => {
					const key = `${id}-${value}`;

					return (
						<div key={key} className="flex items-center space-x-2">
							<RadioGroupItem value={value} id={key} />
							<Label
								htmlFor={key}
								className="font-normal cursor-pointer"
							>
								{label}
							</Label>
						</div>
					);
				})}
			</RadioGroup>
		</>
	</FormElement>
);

// export const FormComponentCalendar = <TValue extends string | null>({
// 	labelText,
// 	id,
// 	fieldName,
// 	fieldValue,
// 	isRequired,
// 	className = 'flex flex-wrap gap-4',
// 	disabled,
// 	error,
// 	onChange,
// }: Omit<
// 	FormComponentProps<TValue>,
// 	'fieldType' | 'placeholderText' | 'autoComplete' | 'icons'
// > & {
// 	options: OptionsType;
// 	onChange: (value: string) => void;
// }) => {
// 	return (
// 		<>
// 			<input type="hidden" name={fieldName} value={fieldValue ?? ''} />
//
// 			<FormElement>
// 				<div className="space-y-2">
// 					<Label>{labelText}</Label>
// 					<Popover>
// 						<PopoverTrigger asChild>
// 							<Button
// 								variant="outline"
// 								className={cn(
// 									'w-full justify-start text-left font-normal',
// 									!fieldValue && 'text-muted-foreground',
// 								)}
// 							>
// 								<CalendarIcon className="mr-2 h-4 w-4" />
// 								{fieldValue ? (
// 									formatDate(fieldValue, 'default')
// 								) : (
// 									<span>Pick a date</span>
// 								)}
// 							</Button>
// 						</PopoverTrigger>
// 						<PopoverContent className="w-auto p-0" align="start">
// 							<Calendar
// 								mode="single"
// 								selected={fieldValue}
// 								onSelect={onChange}
// 								initialFocus
// 								className="pointer-events-auto"
// 							/>
// 						</PopoverContent>
// 					</Popover>
// 				</div>
// 			</FormElement>
// 		</>
// 	);
// };

// export const FormComponentTextarea = ({
// 	labelText,
// 	id,
// 	fieldName,
// 	fieldValue,
// 	isRequired = false,
// 	className = 'resize-none',
// 	placeholderText,
// 	disabled,
// 	autoComplete,
// 	onChange,
// 	error,
// }: FormComponentProps) => {
// 	const { borderClass } = useFieldState({ value: fieldValue, error });
//
// 	return (
// 		<FormElement
// 			label={{ for: id, text: labelText, required: isRequired }}
// 			error={error}
// 		>
// 			<Textarea
// 				id={id}
// 				name={fieldName}
// 				value={fieldValue}
// 				className={cn(borderClass, className)}
// 				placeholder={placeholderText}
// 				autoComplete={autoComplete}
// 				disabled={disabled}
// 				aria-invalid={!!error}
// 				onChange={onChange}
// 				rows={6}
// 			/>
// 		</FormElement>
// 	);
// };
//
// export const FormComponentAutoComplete = ({
// 	labelText,
// 	id,
// 	fieldType = 'text',
// 	fieldName,
// 	fieldValue,
// 	isRequired = false,
// 	className,
// 	placeholderText,
// 	disabled,
// 	onChange,
// 	error,
// 	suggestions = [],
// 	completeMethod,
// }: FormComponentProps & {
// 	suggestions: string[];
// 	completeMethod: (event: AutoCompleteCompleteEvent) => void;
// }) => {
// 	const { borderClass } = useFieldState({ value: fieldValue, error });
//
// 	return (
// 		<FormElement
// 			label={{ for: id, text: labelText, required: isRequired }}
// 			error={error}
// 		>
// 			<AutoComplete
// 				type={fieldType}
// 				id={id}
// 				name={fieldName}
// 				value={fieldValue}
// 				suggestions={suggestions}
// 				completeMethod={completeMethod}
// 				onChange={onChange}
// 				className={cn(borderClass, className)}
// 				placeholder={placeholderText}
// 				disabled={disabled}
// 				dropdown
// 			/>
// 		</FormElement>
// 	);
// };

/** Common form elements **/

export const FormComponentSubmit = ({
	pending,
	submitted,
	errors,
	buttonVariant = 'default',
	buttonLabel,
	buttonIcon,
}: {
	pending: boolean;
	submitted: boolean;
	errors: Record<string, string[]>;
	buttonVariant?: 'default' | 'error' | 'success' | 'warning';
	buttonLabel: string;
	buttonIcon?: JSX.Element;
}) => {
	const translationsKeys = useMemo(
		() => ['app.text.please_wait'] as const,
		[],
	);

	const { translations } = useTranslation(translationsKeys);

	return (
		<Button
			type="submit"
			variant={buttonVariant}
			className="w-full cursor-pointer"
			disabled={pending || (submitted && Object.keys(errors).length > 0)}
			aria-busy={pending}
		>
			{pending ? (
				<span className="flex items-center gap-1.5">
					<LoadingIcon />
					{translations['app.text.please_wait']}
				</span>
			) : submitted && Object.keys(errors).length > 0 ? (
				<span className="flex items-center gap-1.5">
					<Icons.Status.Error className="animate-pulse" />
					{buttonLabel}
				</span>
			) : (
				<span className="flex items-center gap-1.5">
					{buttonIcon} {buttonLabel}
				</span>
			)}
		</Button>
	);
};

export const FormComponentName = <TValue extends InputValueType>(
	props: Omit<
		FormComponentProps<TValue>,
		'fieldName' | 'fieldType' | 'autoComplete' | 'icons'
	>,
) => (
	<FormComponentInput
		{...props}
		fieldName="name"
		isRequired={props.isRequired ?? true}
		className={cn('pl-8', props.className)}
		autoComplete="name"
		placeholderText="eg: John Doe"
		icons={{
			left: <Icons.User className="opacity-40 h-4.5 w-4.5" />,
		}}
	/>
);

export const FormComponentEmail = <TValue extends InputValueType>(
	props: Omit<
		FormComponentProps<TValue>,
		'fieldName' | 'fieldType' | 'autoComplete' | 'icons'
	> & {
		fieldName?: 'email' | 'email_new';
	},
) => (
	<FormComponentInput
		{...props}
		fieldName={props.fieldName || 'email'}
		isRequired={props.isRequired ?? true}
		className={cn('pl-8', props.className)}
		autoComplete="email"
		placeholderText="eg: example@domain.com"
		icons={{ left: <Icons.Email className="opacity-40 h-4.5 w-4.5" /> }}
	/>
);

export const FormComponentPassword = <TValue extends InputValueType>({
	showPassword,
	setShowPassword,
	...props
}: FormComponentProps<TValue> & {
	showPassword: boolean;
	setShowPassword?: (showPassword: boolean) => void;
}) => (
	<FormComponentInput
		{...props}
		fieldType={showPassword ? 'text' : 'password'}
		fieldName={props.fieldName ?? 'password'}
		isRequired={props.isRequired ?? true}
		className={cn('px-8', props.className)}
		autoComplete={props.autoComplete ?? 'new-password'}
		placeholderText={props.placeholderText ?? 'Password'}
		icons={{
			left: <Icons.Password className="opacity-40 h-4.5 w-4.5" />,
			right: setShowPassword && (
				<button
					type="button"
					onClick={() => setShowPassword(!showPassword)}
					className="focus:outline-none hover:opacity-100 transition-opacity"
				>
					{showPassword ? (
						<Icons.Obscured className="opacity-60 hover:opacity-100 h-4.5 w-4.5" />
					) : (
						<Icons.Visible className="opacity-60 hover:opacity-100 h-4.5 w-4.5" />
					)}
				</button>
			),
		}}
	/>
);
