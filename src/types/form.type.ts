import type { ZodSafeParseError, ZodSafeParseSuccess } from 'zod';

export type FormSituationType = 'success' | 'error' | null;
type FormValueType = string | number | boolean | Date | null | undefined;
export type FormValuesType = {
	[key: string]:
		| FormValueType
		| FormValuesType
		| Record<string, FormValueType>[];
};

export type GetFormValuesFnType<FormValues> = (
	formData: FormData,
) => FormValues;

export type ValidateFormReturnType<FormValues> =
	| ZodSafeParseSuccess<FormValues>
	| ZodSafeParseError<FormValues>;

export type ValidateFormFnType<FormValues> = (
	values: FormValues,
) => ValidateFormReturnType<FormValues>;

export type FormErrorsType<FormValues extends FormValuesType> = {
	[K in keyof FormValues]?: FormValues[K] extends Array<infer Item>
		? Item extends FormValuesType
			? Array<FormErrorsType<Item>>
			: string[]
		: FormValues[K] extends FormValuesType
			? FormErrorsType<FormValues[K]>
			: string[];
};

export type TouchedFieldsType<T> = {
	[K in keyof T]?: T[K] extends FormValuesType
		? TouchedFieldsType<T[K]>
		: boolean;
};

export type FormStateType<FormValues extends FormValuesType> = {
	values: FormValues;
	errors: FormErrorsType<FormValues>;
	message: string | null;
	situation: FormSituationType;
	resultData?: unknown;
};

export type GetFormStateFnType<FormValues extends FormValuesType, Data> = (
	data?: Data,
) => FormStateType<FormValues>;

export type FormComponentType<FormValues extends FormValuesType> = {
	formOperation: string;
	formValues: FormValues;
	errors: FormErrorsType<FormValues>;
	handleChange: <K extends keyof FormValues>(
		field: K,
		value: FormValues[K],
	) => void;
	pending: boolean;
};
