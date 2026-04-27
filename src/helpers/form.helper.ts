import type { Dispatch, SetStateAction } from 'react';
import sanitizeHtml from 'sanitize-html';
import type { z } from 'zod';
import { translate } from '@/config/translate.setup';
import type {
	CreateFunctionType,
	FormOperationFunctionType,
	UpdateFunctionType,
} from '@/types/action.type';
import type {
	FormErrorsType,
	FormStateType,
	FormValuesType,
	GetFormValuesFnType,
	TouchedFieldsType,
	ValidateFormFnType,
} from '@/types/form.type';

export async function processForm<Entry, FormValues extends FormValuesType>(
	formState: FormStateType<FormValues>,
	formData: FormData,
	getFormValues: GetFormValuesFnType<FormValues>,
	validateForm: ValidateFormFnType<FormValues>,
	operationFunction: FormOperationFunctionType<Entry, FormValues>,
	entryId?: number, // Only provided for update operations
): Promise<FormStateType<FormValues>> {
	try {
		const formValues = getFormValues(formData);
		const validated = validateForm(formValues);

		if (!validated.success) {
			const errors = accumulateZodErrors<FormValues>(validated.error);

			return {
				...formState,
				values: formValues,
				situation: 'error',
				message: await translate('app.error.validation'),
				errors,
			};
		}

		// If entryId is provided, it's an update operation — pass id as second argument.
		const fetchResponse =
			entryId !== undefined
				? await (
						operationFunction as UpdateFunctionType<
							Entry,
							FormValues
						>
					)(validated.data, entryId)
				: await (
						operationFunction as CreateFunctionType<
							Entry,
							FormValues
						>
					)(validated.data);

		return {
			...formState,
			values: validated.data,
			message: fetchResponse?.message || null,
			situation: fetchResponse?.success ? 'success' : 'error',
			resultData: fetchResponse?.data,
		};
	} catch {
		return {
			...formState,
			message: await translate('app.error.form'),
			situation: 'error',
		};
	}
}

export function accumulateZodErrors<T extends FormValuesType>(
	zodError: z.ZodError,
): FormErrorsType<T> {
	const fieldErrors: FormErrorsType<T> = {};

	for (const issue of zodError.issues) {
		if (issue.path.length === 0) continue;

		// Walk the path and build nested objects as needed
		let current = fieldErrors as Record<string, unknown>;

		for (let i = 0; i < issue.path.length - 1; i++) {
			const segment = issue.path[i] as string;

			if (!current[segment] || typeof current[segment] !== 'object') {
				current[segment] = {};
			}

			current = current[segment] as Record<string, unknown>;
		}

		const lastSegment = issue.path[issue.path.length - 1] as string;

		if (!Array.isArray(current[lastSegment])) {
			current[lastSegment] = [];
		}

		(current[lastSegment] as string[]).push(issue.message);
	}

	return fieldErrors;
}

export function filterErrorsByTouched<FormValues extends FormValuesType>(
	errors: FormErrorsType<FormValues>,
	touched: TouchedFieldsType<FormValues>,
): FormErrorsType<FormValues> {
	const visible: FormErrorsType<FormValues> = {};

	for (const key of Object.keys(touched) as (keyof FormValues)[]) {
		const touchedValue = touched[key];
		const errorValue = errors[key];

		if (!errorValue) {
			continue;
		}

		if (
			typeof touchedValue === 'object' &&
			typeof errorValue === 'object' &&
			!Array.isArray(errorValue)
		) {
			// Recurse into nested touched / error objects
			(visible as Record<string, unknown>)[key as string] =
				filterErrorsByTouched(
					errorValue as FormErrorsType<FormValuesType>,
					touchedValue as TouchedFieldsType<FormValuesType>,
				);
		} else if (touchedValue === true) {
			const k = key as keyof FormValues;

			visible[k] = errorValue as FormErrorsType<FormValues>[typeof k];
		}
	}

	return visible;
}

export function safeHtml(dirtyHtml: string): string {
	return sanitizeHtml(dirtyHtml, {
		allowedTags: [
			'p',
			'br',
			'strong',
			'em',
			'i',
			'b',
			'u',
			'span',
			'div',
			'h1',
			'h2',
			'h3',
			'h4',
			'h5',
			'h6',
			'ul',
			'ol',
			'li',
			'blockquote',
			'code',
			'pre',
			'a',
			'img',
			'table',
			'thead',
			'tbody',
			'tr',
			'th',
			'td',
		],
		allowedAttributes: {
			a: ['href', 'title', 'target'],
			img: ['src', 'alt', 'width', 'height'],
		},
		disallowedTagsMode: 'discard',
		allowedSchemes: ['http', 'https', 'mailto'],
		allowProtocolRelative: false,
	});
}

export function createHandleChange<FormValues extends FormValuesType>(
	setFormValues: Dispatch<SetStateAction<FormValues>>,
	markFieldAsTouched: (path: string) => void, // now a string path, not keyof FormValues
) {
	return <K extends keyof FormValues>(
		field: K,
		value: FormValues[K],
		touchPath?: string,
	) => {
		setFormValues((prev) => ({ ...prev, [field]: value }));
		markFieldAsTouched(touchPath ?? (field as string)); // use touchPath if provided
	};
}

export function getFormDataAsString(
	formData: FormData,
	key: string,
): string | null {
	const formValue = formData.get(key);

	return formValue ? String(formValue) : null;
}

export function getFormDataAsNumber(
	formData: FormData,
	key: string,
): number | null {
	const formValue = formData.get(key);

	return formValue ? Number(formValue) : null;
}

export function getFormDataAsBoolean(formData: FormData, key: string): boolean {
	return Boolean(formData.get(key));
}

export function getFormDataAsEnum<T extends Record<string, string>>(
	formData: FormData,
	key: string,
	enumObject: T,
): T[keyof T] | null {
	const formValue = formData.get(key);

	if (formValue && typeof formValue === 'string') {
		const enumValues = Object.values(enumObject);
		const foundValue = enumValues.find((value) => value === formValue);

		if (foundValue) {
			return foundValue as T[keyof T];
		}
	}

	return null;
}

// export function getFormDataAsArray(
// 	formData: FormData,
// 	schemaKey: string,
// ): Record<number, Record<string, FormDataEntryValue>> {
// 	const schema: Record<number, Record<string, FormDataEntryValue>> = {};
//
// 	for (const [key, value] of formData.entries()) {
// 		const match = key.match(new RegExp(`^${schemaKey}[(d+)][(w+)]$`));
//
// 		if (!match) {
// 			continue;
// 		}
//
// 		const index = Number(match[1]);
// 		const field = match[2];
//
// 		if (!schema[index]) {
// 			schema[index] = {};
// 		}
//
// 		schema[index][field] = value;
// 	}
//
// 	return schema;
// }

// export function getFormDataAsDate(formData: FormData, key: string): Date {
// 	return new Date(formData.get(key) as string);
// }
//
// export function getFormDataAsArray(formData: FormData, key: string): string[] {
// 	return (formData.get(key) as string).split(',');
// }

export function toOptionsFromEnum(
	enumObj: Record<string, string>,
	options?: {
		formatter?: (value: string) => string;
	},
): Array<{ label: string; value: string }> {
	const values = Object.values(enumObj);

	return values.map((value) => ({
		label: options?.formatter ? options.formatter(value) : value,
		value,
	}));
}
