import { AlertCircle, AlertTriangle, CheckCircle } from 'lucide-react';
import {
	AutoComplete,
	type AutoCompleteCompleteEvent,
} from 'primereact/autocomplete';
import { Dropdown, type DropdownChangeEvent } from 'primereact/dropdown';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import React, { type JSX, useMemo } from 'react';
import { FormElementError } from '@/components/form/form-element-error.component';
import { FormPart } from '@/components/form/form-part.component';
import { Icons } from '@/components/icon.component';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useTranslation } from '@/hooks/use-translation.hook';
import {cn} from "@/helpers/css.helper";

export const FormElement = ({
	children,
	className,
	labelText,
	labelFor,
	isRequired = false,
}: {
	children: JSX.Element;
	className?: string;
	labelText?: string;
	labelFor?: string;
	isRequired?: boolean;
}): JSX.Element | null => (
	<div className={cn('form-element', className)}>
		{labelText &&
			(labelFor ? (
				<Label htmlFor={labelFor}>
					{labelText}
					{isRequired && <span className="text-error ml-1">*</span>}
				</Label>
			) : (
				<div className="label-placeholder">{labelText}</div>
			))}
		{children}
	</div>
);

export const FormElementWrapper = ({
	children,
	className,
}: {
	children: JSX.Element;
	className?: string;
}): JSX.Element | null => (
	<div className={cn('form-element-wrapper', className)}>
		{children}
	</div>
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
	<div className={cn('form-element-icon', position === 'left' ? 'left-2' : 'right-2', className)}>
		{children}
	</div>
);

export type OptionsType = {
	label: string;
	value: string;
}[];

export type OnChangeType = (
	e:
		| DropdownChangeEvent
		| React.ChangeEvent<
				HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
		  >,
) => void;

const stateConfig = {
	default: {
		borderClass: '',
		icon: null,
		iconClass: '',
	},
	success: {
		borderClass: 'border-success focus-visible:ring-success',
		icon: CheckCircle,
		iconClass: 'text-success',
	},
	error: {
		borderClass: 'border-error focus-visible:ring-error',
		icon: AlertCircle,
		iconClass: 'text-error',
	},
	warning: {
		borderClass: 'border-warning focus-visible:ring-warning',
		icon: AlertTriangle,
		iconClass: 'text-warning',
	},
};

export type FormComponentProps = {
	labelText: string;
	id: string;
	fieldType?: 'text' | 'password' | 'email' | 'number';
	fieldName: string;
	fieldValue: string;
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
	onChange: OnChangeType;
	error?: string[];
};

/** Standard form elements **/

export const FormComponentInput = ({
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
}: FormComponentProps) => (
	<FormPart>
		<FormElement
			labelText={labelText}
			labelFor={id}
			isRequired={isRequired}
		>
			<div>
				<Input
					type={fieldType}
					id={id}
					name={fieldName}
					value={fieldValue}
					className={className}
					placeholder={placeholderText}
					autoComplete={autoComplete}
					disabled={disabled}
					aria-invalid={!!error}
					onChange={onChange}
				/>
				<FormElementError messages={error} />
			</div>
		</FormElement>
	</FormPart>
);

export const FormComponentAutoComplete = ({
	labelText,
	id,
	fieldType = 'text',
	fieldName,
	fieldValue,
	isRequired = false,
	className,
	placeholderText,
	disabled,
	onChange,
	error,
	suggestions = [],
	completeMethod,
}: FormComponentProps & {
	suggestions: string[];
	completeMethod: (event: AutoCompleteCompleteEvent) => void;
}) => {
	return (
		<FormPart>
			<FormElement
				labelText={labelText}
				labelFor={id}
				isRequired={isRequired}
			>
				<div>
					<AutoComplete
						type={fieldType}
						id={id}
						name={fieldName}
						value={fieldValue}
						suggestions={suggestions}
						completeMethod={completeMethod}
						onChange={onChange}
						className={className}
						placeholder={placeholderText}
						disabled={disabled}
						dropdown
					/>
					<FormElementError messages={error} />
				</div>
			</FormElement>
		</FormPart>
	);
};

export const FormComponentSelect = ({
	labelText,
	id,
	fieldName,
	fieldValue,
	isRequired = false,
	className,
	panelStyle = { fontSize: '0.875rem' },
	placeholderText = '-select-',
	disabled,
	onChange,
	error,
	options,
}: FormComponentProps & {
	panelStyle?: React.CSSProperties;
	options: OptionsType;
}) => (
	<FormPart>
		<FormElement
			labelText={labelText}
			labelFor={id}
			isRequired={isRequired}
		>
			<div>
				<input type="hidden" name={fieldName} value={fieldValue} />
				<Dropdown
					inputId={id}
					className={className}
					panelStyle={panelStyle}
					placeholder={placeholderText}
					disabled={disabled}
					value={fieldValue}
					options={options}
					onChange={onChange}
				/>
				<FormElementError messages={error} />
			</div>
		</FormElement>
	</FormPart>
);

export const FormComponentRadio = ({
	labelText,
	id,
	fieldName,
	fieldValue,
	disabled,
	onChange,
	error,
	options,
}: FormComponentProps & {
	options: OptionsType;
}) => (
	<FormPart>
		<FormElement labelText={labelText}>
			<div>
				<div className="flex flex-wrap gap-4">
					{options.map(({ label, value }) => (
						<div key={value} className="flex items-center gap-1.5">
							<input
								type="radio"
								id={`${id}-${value}`}
								name={fieldName}
								value={value}
								className={cn('radio', {
									'radio-error': error,
									'radio-info': !error,
								})}
								disabled={disabled}
								checked={fieldValue === value}
								onChange={onChange}
							/>
							<label
								htmlFor={`${id}-${value}`}
								className="text-sm font-normal cursor-pointer"
							>
								{label}
							</label>
						</div>
					))}
				</div>
				<FormElementError messages={error} />
			</div>
		</FormElement>
	</FormPart>
);

export const FormComponentTextarea = ({
	labelText,
	id,
	fieldName,
	fieldValue,
	isRequired = false,
	className = 'resize-none',
	placeholderText,
	disabled,
	autoComplete,
	onChange,
	error,
}: FormComponentProps) => (
	<FormPart>
		<FormElement
			labelText={labelText}
			labelFor={id}
			isRequired={isRequired}
		>
			<div>
				<Textarea
					id={id}
					name={fieldName}
					value={fieldValue}
					className={className}
					placeholder={placeholderText}
					autoComplete={autoComplete}
					disabled={disabled}
					aria-invalid={!!error}
					onChange={onChange}
					rows={6}
				/>
				<FormElementError messages={error} />
			</div>
		</FormElement>
	</FormPart>
);

/** Common form elements **/

export const FormComponentSubmit = ({
	pending,
	submitted,
	errors,
	buttonLabel,
	buttonIcon,
}: {
	pending: boolean;
	submitted: boolean;
	errors: Record<string, string[]>;
	buttonLabel: string;
	buttonIcon?: React.JSX.Element;
}) => {
	const translationsKeys = useMemo(
		() => ['app.text.please_wait'] as const,
		[],
	);

	const { translations } = useTranslation(translationsKeys);

	return (
		<FormPart>
			<Button
				type="submit"
				className="w-full h-11"
				disabled={
					pending || (submitted && Object.keys(errors).length > 0)
				}
				aria-busy={pending}
			>
				{pending ? (
					<span className="flex items-center gap-1.5">
						<Icons.Loading className="animate-spin" />
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
		</FormPart>
	);
};

export const FormComponentName = ({
	labelText,
	id,
	fieldName = 'name',
	fieldValue,
	isRequired = true,
	className,
	placeholderText = 'eg: John Doe',
	autoComplete = 'name',
	disabled,
	onChange,
	error,
}: Omit<FormComponentProps, 'fieldName'> & { fieldName?: string }) => (
	<FormPart>
		<FormElement
			labelText={labelText}
			labelFor={id}
			isRequired={isRequired}
		>
			<div>
				<IconField iconPosition="left">
					<InputIcon className="flex items-center">
						<Icons.Entity.User className="opacity-60" />
					</InputIcon>
					<Input
						className={className}
						id={id}
						name={fieldName}
						placeholder={placeholderText}
						autoComplete={autoComplete}
						disabled={disabled}
						aria-invalid={!!error}
						value={fieldValue}
						onChange={onChange}
					/>
				</IconField>
				<FormElementError messages={error} />
			</div>
		</FormElement>
	</FormPart>
);

export const FormComponentEmail = ({
	labelText,
	id,
	fieldName = 'email',
	fieldValue,
	isRequired = true,
	className,
	placeholderText = 'eg: example@domain.com',
	autoComplete = 'email',
	disabled,
	onChange,
	error,
}: Omit<FormComponentProps, 'fieldName'> & { fieldName?: string }) => (
	<FormPart>
		<FormElement
			labelText={labelText}
			labelFor={id}
			isRequired={isRequired}
		>
			<>
				<FormElementWrapper>
					<>
						<FormElementIcon position="left">
							<Icons.Email className="opacity-40 h-5 w-5" />
						</FormElementIcon>
						<Input
							className={cn('pl-8', className)}
							id={id}
							name={fieldName}
							placeholder={placeholderText}
							autoComplete={autoComplete}
							disabled={disabled}
							aria-invalid={!!error}
							value={fieldValue}
							onChange={onChange}
						/>
					</>
				</FormElementWrapper>
				<FormElementError messages={error} />
			</>
		</FormElement>
	</FormPart>
);

export const FormComponentPassword = ({
	labelText = 'Password',
	id,
	fieldName = 'password',
	fieldValue,
	isRequired = true,
	className,
	placeholderText = 'Password',
	autoComplete = 'new-password',
	disabled,
	onChange,
	error,
	showPassword,
	setShowPassword,
}: Omit<FormComponentProps, 'fieldName' | 'autoComplete'> & {
	fieldName?: string;
	autoComplete?: 'current-password' | 'new-password';
	showPassword: boolean;
	setShowPassword?: (showPassword: boolean) => void;
}) => (
	<FormPart>
		<FormElement
			labelText={labelText}
			labelFor={id}
			isRequired={isRequired}
		>
			<>
				<FormElementWrapper>
					<>
						<FormElementIcon position="left">
							<Icons.Password className="opacity-40 h-5 w-5" />
						</FormElementIcon>
						<Input
							className={cn('pl-8', className)}
							id={id}
							name={fieldName}
							type={showPassword ? 'text' : 'password'}
							placeholder={placeholderText}
							autoComplete={autoComplete}
							disabled={disabled}
							aria-invalid={!!error}
							value={fieldValue}
							onChange={onChange}
						/>
						{setShowPassword && (
							<button
								type="button"
								className="absolute right-3 top-3 focus:outline-none hover:opacity-100 transition-opacity"
								onClick={() => setShowPassword(!showPassword)}
								aria-label={
									showPassword ? 'Hide password' : 'Show password'
								}
							>
								{showPassword ? (
									<Icons.Obscured className="opacity-60 hover:opacity-100 w-4 h-4" />
								) : (
									<Icons.Visible className="opacity-60 hover:opacity-100 w-4 h-4" />
								)}
							</button>
						)}
					</>
				</FormElementWrapper>
				<FormElementError messages={error} />
			</>
		</FormElement>
	</FormPart>
);
