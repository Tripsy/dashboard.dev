import type { ZodSafeParseError, ZodSafeParseSuccess } from 'zod';

export type FormSituationType = 'success' | 'error' | null;
export type FormValuesType = Record<
	string,
	string | number | boolean | Date | null | undefined
>;

export type GetFormValuesFnType<FormValues> = (
	formData: FormData,
) => FormValues;

export type ValidateFormReturnType<FormValues> =
	| ZodSafeParseSuccess<FormValues>
	| ZodSafeParseError<FormValues>;

export type ValidateFormFnType<FormValues> = (
	values: FormValues,
) => ValidateFormReturnType<FormValues>;

export type FormStateType<FormValues> = {
	values: FormValues;
	errors: Partial<Record<keyof FormValues, string[]>>;
	message: string | null;
	situation: FormSituationType;
	resultData?: unknown;
};

export type SyncFormStateFnType<FormValues, Model> = (
	state: FormStateType<FormValues>,
	data: Model,
) => FormStateType<FormValues>;

export type FormComponentType<FormValues> = {
	formOperation: string;
	formValues: FormValues;
	errors: Partial<Record<keyof FormValues, string[]>>;
	handleChange: (
		field: keyof FormValues,
		value: string | number | boolean | Date | null,
	) => void;
	pending: boolean;
};
