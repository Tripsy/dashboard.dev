import React, { type JSX, useEffect, useMemo, useRef, useState } from 'react';
import { FormElementError } from '@/components/form/form-element-error.component';
import { getActionIcon, Icons } from '@/components/icon.component';
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
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/helpers/css.helper';
import { formatDate, stringToDate } from '@/helpers/date.helper';
import { useTranslation } from '@/hooks/use-translation.hook';

export type InputValueType = string | null | undefined;
export type OptionValueType = string | null | undefined;
export type CheckboxValueType = boolean;
export type OptionsType = {
	label: string;
	value: string;
}[];
export type GroupedOptionsType = {
	label: string;
	options: OptionsType;
}[];

export const FormElement = ({
	children,
	className,
	label,
	error,
}: {
	children: JSX.Element;
	className?: string;
	label?: { text?: string; for?: string; required?: boolean };
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
	value?: string | number | boolean | null;
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

export type FormComponentProps<Fields, Value> = {
	id: string;
	labelText?: string;
	fieldType?: 'text' | 'password' | 'email' | 'number' | 'time';
	fieldName: keyof Fields & string;
	fieldValue: Value;
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

export const FormComponentInput = <Fields,>({
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
}: FormComponentProps<Fields, InputValueType | number>) => {
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

type FormComponentTimeProps<Fields> = Omit<
	FormComponentProps<Fields, InputValueType>,
	'fieldType' | 'autoComplete' | 'icons'
> & {
	minTime?: string;
	maxTime?: string;
	minuteInterval?: number;
};

export const FormComponentTime = <Fields,>({
	labelText,
	id,
	fieldName,
	fieldValue,
	isRequired = false,
	className = 'min-w-36',
	placeholderText = '--:--',
	disabled,
	onChange,
	error,
	minTime,
	maxTime,
	minuteInterval = 1,
}: FormComponentTimeProps<Fields>) => {
	const [open, setOpen] = useState(false);
	const { borderClass } = useFieldState({ value: fieldValue, error });

	const hours = Array.from({ length: 24 }, (_, i) =>
		String(i).padStart(2, '0'),
	).filter((h) => {
		if (minTime && `${h}:59` < minTime) {
			return false;
		}

		if (maxTime && `${h}:00` > maxTime) {
			return false;
		}

		return true;
	});

	const getMinutes = (selectedHour: string) => {
		const interval = minuteInterval > 1 ? minuteInterval : 1;
		return Array.from({ length: Math.floor(60 / interval) }, (_, i) =>
			String(i * interval).padStart(2, '0'),
		).filter((m) => {
			const time = `${selectedHour}:${m}`;

			if (minTime && time < minTime) {
				return false;
			}

			if (maxTime && time > maxTime) {
				return false;
			}

			return true;
		});
	};

	const [selectedHour, selectedMinute] = fieldValue
		? fieldValue.split(':')
		: [null, null];

	const handleHourSelect = (hour: string) => {
		const minutes = getMinutes(hour);
		const minute =
			selectedMinute && minutes.includes(selectedMinute)
				? selectedMinute
				: minutes[0];

		const syntheticEvent = {
			target: { value: `${hour}:${minute ?? '00'}`, name: fieldName },
		} as React.ChangeEvent<HTMLInputElement>;

		onChange(syntheticEvent);
	};

	const handleMinuteSelect = (minute: string) => {
		const hour = selectedHour ?? '00';

		const syntheticEvent = {
			target: { value: `${hour}:${minute}`, name: fieldName },
		} as React.ChangeEvent<HTMLInputElement>;

		onChange(syntheticEvent);

		setOpen(false);
	};

	const minutes = selectedHour ? getMinutes(selectedHour) : [];

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
				/>
				<Popover open={open} onOpenChange={setOpen}>
					<PopoverTrigger asChild>
						<Button
							id={id}
							variant="outline"
							className={cn(
								'justify-start text-left text-sm',
								!fieldValue && 'text-muted-foreground',
								borderClass,
								className,
							)}
							disabled={disabled}
						>
							<Icons.Clock className="mr-2 h-4 w-4" />
							{fieldValue ?? <span>{placeholderText}</span>}
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-auto p-2" align="start">
						<div className="flex gap-2">
							{/* Hours */}
							<div className="flex flex-col gap-1">
								<p className="text-xs text-muted-foreground text-center pb-1">
									HH
								</p>
								<ul className="h-48 overflow-y-auto flex flex-col gap-0.5">
									{hours.map((hour) => (
										<li key={hour}>
											<button
												type="button"
												onClick={() =>
													handleHourSelect(hour)
												}
												className={cn(
													'w-full px-3 py-1 text-sm rounded hover:bg-accent',
													selectedHour === hour &&
														'bg-accent font-semibold',
												)}
											>
												{hour}
											</button>
										</li>
									))}
								</ul>
							</div>

							<div className="w-px bg-border" />

							{/* Minutes */}
							<div className="flex flex-col gap-1">
								<p className="text-xs text-muted-foreground text-center pb-1">
									MM
								</p>
								<ul className="h-48 overflow-y-auto flex flex-col gap-0.5">
									{minutes.map((minute) => (
										<li key={minute}>
											<button
												type="button"
												onClick={() =>
													handleMinuteSelect(minute)
												}
												className={cn(
													'w-full px-3 py-1 text-sm rounded hover:bg-accent',
													selectedMinute === minute &&
														'bg-accent font-semibold',
												)}
											>
												{minute}
											</button>
										</li>
									))}
								</ul>
							</div>
						</div>
					</PopoverContent>
				</Popover>
			</div>
		</FormElement>
	);
};

export const FormComponentTextarea = <Fields,>({
	labelText,
	id,
	fieldName,
	fieldValue,
	isRequired = false,
	className = 'w-full',
	placeholderText,
	disabled,
	onChange,
	error,
	rows,
}: Omit<
	FormComponentProps<Fields, InputValueType>,
	'fieldType' | 'autoComplete' | 'onChange' | 'icons'
> & {
	onChange: React.ChangeEventHandler<HTMLTextAreaElement>;
	rows: number;
}) => {
	const { borderClass } = useFieldState({ value: fieldValue, error });

	return (
		<FormElement
			label={{ for: id, text: labelText, required: isRequired }}
			error={error}
		>
			<FormElementWrapper>
				<Textarea
					id={id}
					name={fieldName}
					value={fieldValue ?? ''}
					className={cn(borderClass, className)}
					placeholder={placeholderText}
					disabled={disabled}
					aria-invalid={!!error}
					onChange={onChange}
					rows={rows}
				/>
			</FormElementWrapper>
		</FormElement>
	);
};

export const FormComponentSelect = <Fields,>({
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
	onChange,
}: Omit<
	FormComponentProps<Fields, OptionValueType>,
	'autoComplete' | 'icons' | 'onChange'
> & {
	options: OptionsType | GroupedOptionsType;
	onChange: (value: string) => void;
}) => {
	const { borderClass } = useFieldState({ value: fieldValue, error });

	const isGrouped = 'options' in options[0];

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
					onValueChange={onChange}
					disabled={disabled}
				>
					<SelectTrigger
						id={id}
						className={cn(borderClass, className)}
					>
						<SelectValue placeholder={placeholderText} />
					</SelectTrigger>
					<SelectContent>
						{isGrouped
							? (options as GroupedOptionsType).map((group) => (
									<SelectGroup key={group.label}>
										<SelectLabel>{group.label}</SelectLabel>

										{group.options.map(
											({ label, value }) => (
												<SelectItem
													key={value}
													value={value}
													className="pl-12"
												>
													{label}
												</SelectItem>
											),
										)}
									</SelectGroup>
								))
							: (options as OptionsType).map(
									({ label, value }) => (
										<SelectItem key={value} value={value}>
											{label}
										</SelectItem>
									),
								)}
					</SelectContent>
					{/*<SelectContent>*/}
					{/*	{options.map(({ label, value }) => {*/}
					{/*		const key = `${id}-${value}`;*/}

					{/*		return (*/}
					{/*			<SelectItem key={key} value={value}>*/}
					{/*				{label}*/}
					{/*			</SelectItem>*/}
					{/*		);*/}
					{/*	})}*/}
					{/*</SelectContent>*/}
				</Select>
			</div>
		</FormElement>
	);
};

export const FormComponentCheckbox = <Fields,>({
	children,
	id,
	fieldName,
	checked,
	className,
	disabled,
	error,
	onCheckedChange,
}: Omit<
	FormComponentProps<Fields, CheckboxValueType>,
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

export const FormComponentRadio = <Fields,>({
	labelText,
	id,
	fieldName,
	fieldValue,
	isRequired,
	className = 'flex flex-wrap gap-4',
	disabled,
	error,
	options,
	onChange,
}: Omit<
	FormComponentProps<Fields, OptionValueType>,
	'fieldType' | 'onChange' | 'placeholderText' | 'autoComplete' | 'icons'
> & {
	options: OptionsType;
	onChange: (value: string) => void;
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
				onValueChange={onChange}
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

export const FormComponentCalendarWithoutFormElement = <Fields,>({
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
	FormComponentProps<Fields, InputValueType>,
	| 'labelText'
	| 'fieldType'
	| 'isRequired'
	| 'autoComplete'
	| 'icons'
	| 'onChange'
> & {
	onSelect: (value: string) => void;
	minDate?: Date;
	maxDate?: Date;
}) => {
	const [open, setOpen] = useState(false);

	const selected = fieldValue ? stringToDate(fieldValue) : undefined;

	return (
		<>
			<input type="hidden" name={fieldName} value={fieldValue ?? ''} />

			<Popover open={open} onOpenChange={setOpen}>
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
						<Icons.Calendar className="mr-2 h-4 w-4" />
						{fieldValue ? (
							fieldValue
						) : (
							<span>{placeholderText}</span>
						)}
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-auto p-0" align="start">
					<Calendar
						mode="single"
						required={false}
						selected={selected}
						onSelect={(date: Date | undefined) => {
							const value = date
								? (formatDate(date, 'default') as string)
								: '';

							onSelect(value);
							setOpen(false);
						}}
						aria-placeholder={placeholderText}
						disabled={[
							...(minDate ? [{ before: minDate }] : []),
							...(maxDate ? [{ after: maxDate }] : []),
						]}
					/>
				</PopoverContent>
			</Popover>
		</>
	);
};

export const FormComponentCalendar = <Fields,>({
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
	minDate,
	maxDate,
}: Omit<
	FormComponentProps<Fields, InputValueType>,
	'fieldType' | 'autoComplete' | 'icons' | 'onChange'
> & {
	onSelect: (value: string) => void;
	minDate?: Date;
	maxDate?: Date;
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
				minDate={minDate}
				maxDate={maxDate}
			/>
		</FormElement>
	);
};

export const FormComponentAutoComplete = <Fields, T>({
	labelText,
	id,
	fieldName,
	fieldValue,
	isRequired = false,
	className = 'w-full',
	placeholderText,
	disabled,
	error,
	icons,
	onInputChange,
	autoCompleteProps,
}: Omit<
	FormComponentProps<Fields, InputValueType>,
	'fieldType' | 'autoComplete' | 'onChange' | 'icons'
> & {
	icons?: { left?: JSX.Element };
	onInputChange?: (value: string) => void;
	autoCompleteProps: {
		suggestions: T[];
		onSelect?: (item: T) => void;

		getOptionLabel: (item: T) => string;
		getOptionKey?: (item: T) => string | number;

		maxSuggestions?: number;

		isLoading?: boolean;
		emptyMessage?: string;
		loadingMessage?: string;

		allowCreate?: boolean;
		onCreate?: (value: string) => void;
		createLabel?: (value: string) => string;
	};
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const [inputValue, setInputValue] = useState(fieldValue ?? '');
	const [highlightedIndex, setHighlightedIndex] = useState(-1);

	const wrapperRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	// Sync external value
	useEffect(() => {
		setInputValue(fieldValue ?? '');
	}, [fieldValue]);

	// Click outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				wrapperRef.current &&
				!wrapperRef.current.contains(event.target as Node)
			) {
				setIsOpen(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () =>
			document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newValue = e.target.value;

		setInputValue(newValue);
		onInputChange?.(newValue);

		setIsOpen(true);
		setHighlightedIndex(-1);
	};

	const handleSuggestionClick = (item: T) => {
		const label = autoCompleteProps.getOptionLabel(item);

		setInputValue(label);
		autoCompleteProps.onSelect?.(item);

		setIsOpen(false);
		setHighlightedIndex(-1);
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (!isOpen) {
			if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
				setIsOpen(true);
			}
			return;
		}

		const suggestionsList = autoCompleteProps.suggestions.slice(
			0,
			autoCompleteProps.maxSuggestions || 99,
		);

		switch (e.key) {
			case 'ArrowDown':
				e.preventDefault();
				setHighlightedIndex((prev) =>
					prev < suggestionsList.length - 1 ? prev + 1 : prev,
				);
				break;

			case 'ArrowUp':
				e.preventDefault();
				setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
				break;

			case 'Enter':
				e.preventDefault();
				if (
					highlightedIndex >= 0 &&
					highlightedIndex < suggestionsList.length
				) {
					handleSuggestionClick(suggestionsList[highlightedIndex]);
				}
				break;

			case 'Escape':
			case 'Tab':
				setIsOpen(false);
				setHighlightedIndex(-1);
				break;
		}
	};

	const handleClear = () => {
		setInputValue('');
		onInputChange?.('');
		inputRef.current?.focus();
	};

	const shouldShowDropdown = isOpen && !disabled && inputValue.length > 0;

	const displayedSuggestions = autoCompleteProps.suggestions.slice(
		0,
		autoCompleteProps.maxSuggestions || 99,
	);

	const { borderClass } = useFieldState({ value: fieldValue, error });

	const isLoading = autoCompleteProps.isLoading;
	const isEmpty =
		!isLoading &&
		displayedSuggestions.length === 0 &&
		!autoCompleteProps.allowCreate;

	const canCreate =
		autoCompleteProps.allowCreate &&
		!isLoading &&
		inputValue.trim().length > 0 &&
		displayedSuggestions.length === 0;

	return (
		<FormElement
			label={{ for: id, text: labelText, required: isRequired }}
			error={error}
		>
			<div ref={wrapperRef} className="relative w-full">
				<FormElementWrapper>
					<div>
						{icons?.left && (
							<FormElementIcon position="left">
								{icons.left}
							</FormElementIcon>
						)}

						<Input
							ref={inputRef}
							type="text"
							id={id}
							name={fieldName}
							value={inputValue}
							className={cn(borderClass, 'pr-8', className)}
							placeholder={placeholderText}
							disabled={disabled}
							aria-invalid={!!error}
							onChange={handleOnChange}
							onKeyDown={handleKeyDown}
						/>

						{inputValue && !disabled && (
							<FormElementIcon position="right">
								<button
									type="button"
									onClick={handleClear}
									className="cursor-pointer"
								>
									<Icons.Clear className="h-4.5 w-4.5 text-muted-foreground hover:text-foreground" />
								</button>
							</FormElementIcon>
						)}
					</div>
				</FormElementWrapper>

				{shouldShowDropdown && (
					<ul className="absolute z-50 w-full mt-1 max-h-60 overflow-auto bg-popover border border-border rounded-md shadow-lg">
						{/* Loading */}
						{isLoading && (
							<li className="px-3 py-2 text-sm text-muted-foreground">
								{autoCompleteProps.loadingMessage ??
									'Searching...'}
							</li>
						)}

						{/* Empty */}
						{isEmpty && (
							<li className="px-3 py-2 text-sm text-muted-foreground">
								{autoCompleteProps.emptyMessage ?? 'No results'}
							</li>
						)}

						{canCreate && (
							<li className="list-none">
								<button
									type="button"
									onClick={() => {
										autoCompleteProps.onCreate?.(
											inputValue,
										);
										setIsOpen(false);
									}}
									className="w-full px-3 py-2 text-sm text-left text-primary hover:bg-accent"
								>
									{autoCompleteProps.createLabel?.(
										inputValue,
									) ?? `Create "${inputValue}"`}
								</button>
							</li>
						)}

						{/* Results */}
						{!isLoading &&
							displayedSuggestions.map((item, index) => {
								const label =
									autoCompleteProps.getOptionLabel(item);
								const key =
									autoCompleteProps.getOptionKey?.(item) ??
									label;

								const isHighlighted =
									index === highlightedIndex;

								return (
									<li key={key} className="list-none">
										<button
											type="button"
											onClick={() =>
												handleSuggestionClick(item)
											}
											onMouseEnter={() =>
												setHighlightedIndex(index)
											}
											className={cn(
												'w-full px-3 py-2 text-sm text-left',
												'hover:bg-accent hover:text-accent-foreground',
												'focus:bg-accent focus:text-accent-foreground',
												isHighlighted &&
													'bg-accent text-accent-foreground',
											)}
										>
											{label}
										</button>
									</li>
								);
							})}
					</ul>
				)}
			</div>
		</FormElement>
	);
};

/** Common form elements **/

type FormComponentSubmitButtonType = {
	label: string;
	variant?: ButtonVariant;
	iconLabel: string;
	iconSize?: number;
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
	const IconButton = getActionIcon(button.iconLabel);

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
					<IconButton size={button.iconSize || 16} /> {button.label}
				</span>
			)}
		</Button>
	);
};

export const FormComponentName = <Fields,>(
	props: Omit<
		FormComponentProps<Fields, InputValueType>,
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

export const FormComponentEmail = <Fields,>(
	props: Omit<
		FormComponentProps<Fields, InputValueType>,
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

export const FormComponentPassword = <Fields,>({
	showPassword,
	setShowPassword,
	...props
}: FormComponentProps<Fields, InputValueType> & {
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
