import sanitizeHtml from 'sanitize-html';
import type { z } from 'zod';
import { translate } from '@/config/translate.setup';
import { ApiError } from '@/exceptions/api.error';
import type { ApiResponseFetch } from '@/types/api.type';
import type {
	FormComponentType,
	FormStateType,
	FormValuesType,
	ValidateFormFnType,
} from '@/types/form.type';

export async function processForm<FormValues>(
	formState: FormStateType<FormValues>,
	formData: FormData,
	getFormValues: (formData: FormData) => FormValues,
	validateForm: ValidateFormFnType<FormValues>,
	fetchFunction: (data: FormValues) => Promise<ApiResponseFetch<unknown>>,
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

		const result = {
			...formState,
			values: validated.data,
		};

		const fetchResponse = await fetchFunction(validated.data);

		return {
			...result,
			errors: {},
			message: fetchResponse?.message || null,
			situation: fetchResponse?.success ? 'success' : 'error',
			resultData: fetchResponse?.data,
		};
	} catch (error) {
		const message =
			error instanceof ApiError
				? error.message
				: await translate('app.error.form');

		return {
			...formState,
			message: message,
			situation: 'error',
		};
	}
}

export function accumulateZodErrors<T>(
	zodError: z.ZodError,
): Partial<Record<keyof T, string[]>> {
	const fieldErrors: Partial<Record<keyof T, string[]>> = {};

	for (const issue of zodError.issues) {
		const fieldPath = issue.path.join('.') as keyof T;

		if (!fieldErrors[fieldPath]) {
			fieldErrors[fieldPath] = [];
		}

		fieldErrors[fieldPath].push(issue.message);
	}

	return fieldErrors;
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
	setFormValues: (updater: (prev: FormValues) => FormValues) => void,
	markFieldAsTouched: (field: keyof FormValues) => void,
): FormComponentType<FormValues>['handleChange'] {
	return (field, value) => {
		setFormValues((prev) => ({ ...prev, [field]: value }));
		markFieldAsTouched(field);
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
