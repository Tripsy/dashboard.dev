import { CalendarIcon } from 'lucide-react';
import React, { type ComponentType, type JSX, useMemo } from 'react';
import { FormElementError } from '@/components/form/form-element-error.component';
import { Icons } from '@/components/icon.component';
import { LoadingIcon } from '@/components/status.component';
import { Button, type ButtonVariant } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
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
import type { FilterValueType } from '@/config/data-source.config';
import { cn } from '@/helpers/css.helper';
import { formatDate, toDateInstance } from '@/helpers/date.helper';
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
				<div>
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
				</div>
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
			<div>
				<input
					type="hidden"
					name={fieldName}
					value={fieldValue ?? ''}
					disabled={disabled}
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
			</div>
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
			<Label htmlFor={id} className="flex items-center gap-2">
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
		<div>
			<input
				type="hidden"
				name={fieldName}
				value={fieldValue ?? ''}
				disabled={disabled}
			/>

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
		</div>
	</FormElement>
);

export const FormComponentCalendarWithoutFormElement = <
	TValue extends string | null,
>({
	id,
	fieldName,
	fieldValue,
	className = 'min-w-40',
	placeholderText,
	disabled,
	onSelect,
	minDate,
	maxDate,
}: Omit<
	FormComponentProps<TValue>,
	| 'labelText'
	| 'fieldType'
	| 'isRequired'
	| 'autoComplete'
	| 'icons'
	| 'onChange'
> & {
	onSelect: (value: string) => void;
	minDate?: Date | string;
	maxDate?: Date | string;
}) => {
	const fieldValueAsDate = toDateInstance(fieldValue) || undefined;
	const minDateAsDate = (minDate && toDateInstance(minDate)) || undefined;
	const maxDateAsDate = (maxDate && toDateInstance(maxDate)) || undefined;

	return (
		<>
			<input
				type="hidden"
				name={fieldName}
				value={fieldValue ?? ''}
				disabled={disabled}
			/>

			<Popover>
				<PopoverTrigger asChild>
					<Button
						id={id}
						variant="outline"
						className={cn(
							'justify-start text-left text-sm',
							!fieldValue && 'text-muted-foreground',
							className,
						)}
						disabled={disabled}
					>
						<CalendarIcon className="mr-2 h-4 w-4" />
						{fieldValue ? (
							formatDate(fieldValue, 'default')
						) : (
							<span>{placeholderText}</span>
						)}
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-auto p-0" align="start">
					<Calendar
						mode="single"
						required={false}
						selected={fieldValueAsDate}
						onSelect={(date: Date | undefined) => {
							const value = date
								? (formatDate(date, 'default') as string)
								: '';

							onSelect(value);
						}}
						aria-placeholder={placeholderText}
						disabled={[
							...(minDateAsDate
								? [{ before: minDateAsDate }]
								: []),
							...(maxDateAsDate
								? [{ after: maxDateAsDate }]
								: []),
						]}
					/>
				</PopoverContent>
			</Popover>
		</>
	);
};

export const FormComponentCalendar = <TValue extends string | null>({
	labelText,
	id,
	fieldName,
	fieldValue,
	isRequired,
	className,
	placeholderText,
	disabled,
	error,
	onSelect,
}: Omit<
	FormComponentProps<TValue>,
	'fieldType' | 'autoComplete' | 'icons' | 'onChange'
> & {
	onSelect: (value: string) => void;
}) => {
	return (
		<FormElement
			label={{ for: id, text: labelText, required: isRequired }}
			error={error}
		>
			<FormComponentCalendarWithoutFormElement
				id={id}
				fieldName={fieldName}
				fieldValue={fieldValue}
				className={className}
				placeholderText={placeholderText}
				disabled={disabled}
				onSelect={onSelect}
			/>
		</FormElement>
	);
};

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

type FormComponentSubmitButtonType = {
	label: string;
	variant?: ButtonVariant;
	icon: ComponentType<{ className?: string }>;
	className?: string;
};

export const FormComponentSubmit = ({
	pending,
	submitted,
	errors,
	button,
}: {
	pending: boolean;
	submitted: boolean;
	errors: Record<string, string[]>;
	button: FormComponentSubmitButtonType;
}) => {
	const translationsKeys = useMemo(
		() => ['app.text.please_wait'] as const,
		[],
	);

	const { translations } = useTranslation(translationsKeys);

	return (
		<Button
			type="submit"
			variant={button.variant}
			className={button.className}
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
					{button.label}
				</span>
			) : (
				<span className="flex items-center gap-1.5">
					<button.icon /> {button.label}
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
