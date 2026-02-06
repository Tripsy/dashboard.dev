import clsx from 'clsx';
import {
	AutoComplete,
	type AutoCompleteCompleteEvent,
} from 'primereact/autocomplete';
import { Dropdown, type DropdownChangeEvent } from 'primereact/dropdown';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { InputText } from 'primereact/inputtext';
import React, { type JSX, useMemo } from 'react';
import { FormElementError } from '@/components/form/form-element-error.component';
import { FormPart } from '@/components/form/form-part.component';
import { Icons } from '@/components/icon.component';
import { useTranslation } from '@/hooks/use-translation.hook';

export const FormElement = ({
	children,
	labelText,
	labelFor,
	className,
}: {
	children: JSX.Element;
	className?: string;
	labelText?: string;
	labelFor?: string;
}): JSX.Element | null => (
	<div className={clsx('form-element', className)}>
		{labelText &&
			(labelFor ? (
				<label htmlFor={labelFor}>{labelText}</label>
			) : (
				<div className="label-placeholder">{labelText}</div>
			))}
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

export type FormComponentProps = {
	labelText: string;
	id: string;
	fieldType?: 'text' | 'password' | 'email' | 'number';
	fieldName: string;
	fieldValue: string;
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

export const FormComponentInput = ({
	labelText,
	id,
	fieldType = 'text',
	fieldName,
	fieldValue,
	className = 'p-inputtext-sm w-full',
	placeholderText,
	disabled,
	autoComplete,
	onChange,
	error,
}: FormComponentProps) => (
	<FormPart>
		<FormElement labelText={labelText} labelFor={id}>
			<div>
				<InputText
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
	className = 'p-inputtext-sm w-full',
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
			<FormElement labelText={labelText} labelFor={id}>
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
	className = 'p-inputtext-sm',
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
		<FormElement labelText={labelText} labelFor={id}>
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
								className={clsx('radio', {
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
			<button
				type="submit"
				className="btn btn-info w-full"
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
			</button>
		</FormPart>
	);
};

export const FormComponentTextarea = ({
	labelText,
	id,
	fieldName,
	fieldValue,
	className = 'resize-none',
	placeholderText,
	disabled,
	autoComplete,
	onChange,
	error,
}: FormComponentProps) => (
	<FormPart>
		<FormElement labelText={labelText} labelFor={id}>
			<div>
				<textarea
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

export const FormComponentName = ({
	labelText,
	id,
	fieldName = 'name',
	fieldValue,
	className = 'p-inputtext-sm w-full',
	placeholderText = 'eg: John Doe',
	autoComplete = 'name',
	disabled,
	onChange,
	error,
}: Omit<FormComponentProps, 'fieldName'> & { fieldName?: string }) => (
	<FormPart>
		<FormElement labelText={labelText} labelFor={id}>
			<div>
				<IconField iconPosition="left">
					<InputIcon className="flex items-center">
						<Icons.Entity.User className="opacity-60" />
					</InputIcon>
					<InputText
						className={className}
						id={id}
						name={fieldName}
						placeholder={placeholderText}
						autoComplete={autoComplete}
						disabled={disabled}
						invalid={!!error}
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
	className = 'p-inputtext-sm w-full',
	placeholderText = 'eg: example@domain.com',
	autoComplete = 'email',
	disabled,
	onChange,
	error,
}: Omit<FormComponentProps, 'fieldName'> & { fieldName?: string }) => (
	<FormPart>
		<FormElement labelText={labelText} labelFor={id}>
			<div>
				<IconField iconPosition="left">
					<InputIcon className="flex items-center">
						<Icons.Email className="opacity-60" />
					</InputIcon>
					<InputText
						className={className}
						id={id}
						name={fieldName}
						placeholder={placeholderText}
						autoComplete={autoComplete}
						disabled={disabled}
						invalid={!!error}
						value={fieldValue}
						onChange={onChange}
					/>
				</IconField>
				<FormElementError messages={error} />
			</div>
		</FormElement>
	</FormPart>
);

export const FormComponentPassword = ({
	labelText = 'Password',
	id,
	fieldName = 'password',
	fieldValue,
	className = 'p-inputtext-sm w-full !pr-10',
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
		<FormElement labelText={labelText} labelFor={id}>
			<div>
				<div className="relative">
					<IconField iconPosition="left">
						<InputIcon className="flex items-center">
							<Icons.Password className="opacity-60" />
						</InputIcon>
						<InputText
							className={className}
							id={id}
							name={fieldName}
							type={showPassword ? 'text' : 'password'}
							placeholder={placeholderText}
							autoComplete={autoComplete}
							disabled={disabled}
							invalid={!!error}
							value={fieldValue}
							onChange={onChange}
						/>
					</IconField>
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
				</div>
				<FormElementError messages={error} />
			</div>
		</FormElement>
	</FormPart>
);
