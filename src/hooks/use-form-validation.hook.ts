import { useCallback, useState } from 'react';
import type { ZodSafeParseError, ZodSafeParseSuccess } from 'zod';
import { accumulateZodErrors } from '@/helpers/form.helper';
import { useDebouncedEffect } from '@/hooks/use-debounced-effect.hook';

export type ValidationReturnType<FormValues> =
	| ZodSafeParseSuccess<FormValues>
	| ZodSafeParseError<FormValues>;

type UseFormValidationProps<FormValues> = {
	formValues: FormValues;
	validate: (values: FormValues) => ValidationReturnType<FormValues>;
	debounceDelay?: number;
};

export type ValidateFormFunctionType<FormValues> = (
	values: FormValues,
	id?: number,
) => ValidationReturnType<FormValues>;

export function useFormValidation<FormValues>({
	formValues,
	validate,
	debounceDelay = 800,
}: UseFormValidationProps<FormValues>) {
	const [errors, setErrors] = useState<
		Partial<Record<keyof FormValues, string[]>>
	>({});
	const [touchedFields, setTouchedFields] = useState<
		Partial<Record<keyof FormValues, boolean>>
	>({});
	const [submitted, setSubmitted] = useState(false);

	const markFieldAsTouched = useCallback((field: keyof FormValues) => {
		setTouchedFields((prev) =>
			prev[field] ? prev : { ...prev, [field]: true },
		);
	}, []);

	const markSubmit = useCallback(() => {
		setSubmitted(true);
	}, []);

	useDebouncedEffect(
		() => {
			const shouldValidate =
				submitted || Object.keys(touchedFields).length > 0;

			if (!shouldValidate) {
				return;
			}

			const result = validate(formValues);

			if (result.success) {
				setErrors({});
				return;
			}

			const allErrors = accumulateZodErrors<FormValues>(result.error);

			if (submitted) {
				setErrors(allErrors);
				return;
			}

			const visibleErrors: Partial<Record<keyof FormValues, string[]>> =
				{};

			for (const key of Object.keys(
				touchedFields,
			) as (keyof FormValues)[]) {
				if (touchedFields[key] && allErrors[key]) {
					visibleErrors[key] = allErrors[key];
				}
			}

			setErrors(visibleErrors);
		},
		[formValues, touchedFields, submitted, validate],
		debounceDelay,
	);

	return {
		errors,
		setErrors,
		touchedFields,
		markFieldAsTouched,
		submitted,
		markSubmit,
	};
}
