import isEqual from 'fast-deep-equal';
import { useCallback, useRef, useState } from 'react';
import type { ZodSafeParseError, ZodSafeParseSuccess } from 'zod';
import { accumulateZodErrors } from '@/helpers/form.helper';
import { useDebouncedEffect } from '@/hooks/use-debounced-effect.hook';

export type ValidationReturnType<K> =
	| ZodSafeParseSuccess<K>
	| ZodSafeParseError<K>;

interface UseFormValidationProps<K> {
	formValues: K;
	validate: (values: K) => ValidationReturnType<K>;
	debounceDelay?: number;
}

export function useFormValidation<T>({
	formValues,
	validate,
	debounceDelay = 800,
}: UseFormValidationProps<T>) {
	const [errors, setErrors] = useState<Partial<Record<keyof T, string[]>>>(
		{},
	);
	const [touchedFields, setTouchedFields] = useState<
		Partial<Record<keyof T, boolean>>
	>({});
	const [submitted, setSubmitted] = useState(false);

	const prevValuesRef = useRef<T>(formValues);
	const prevTouchedRef = useRef(touchedFields);
	const prevSubmittedRef = useRef(submitted);

	const markFieldAsTouched = useCallback((field: keyof T) => {
		setTouchedFields((prev) =>
			prev[field] ? prev : { ...prev, [field]: true },
		);
	}, []);

	useDebouncedEffect(
		() => {
			const valuesChanged = !isEqual(prevValuesRef.current, formValues);
			const touchedChanged = !isEqual(
				prevTouchedRef.current,
				touchedFields,
			);
			const submittedChanged = prevSubmittedRef.current !== submitted;

			// Reset submitted if values changed
			if (submitted && valuesChanged) {
				setSubmitted(false);
			}

			const shouldValidate =
				submitted || Object.keys(touchedFields).length > 0;

			prevValuesRef.current = formValues;
			prevTouchedRef.current = touchedFields;
			prevSubmittedRef.current = submitted;

			// Check if we should run validation
			if (
				!shouldValidate ||
				(!valuesChanged && !touchedChanged && !submittedChanged)
			) {
				return;
			}

			// Determine fields to validate
			const fieldsToValidate = submitted
				? formValues
				: Object.keys(touchedFields).reduce(
						(acc, key) => {
							if (touchedFields[key as keyof T]) {
								acc[key as keyof T] =
									formValues[key as keyof T];
							}

							return acc;
						},
						{} as Partial<T>,
					);

			if (Object.keys(fieldsToValidate).length === 0) {
				return;
			}

			const validated = validate(formValues);

			if (validated.success) {
				setErrors({});
			} else {
				const fieldErrors = accumulateZodErrors<T>(validated.error);

				if (submitted) {
					// Show ALL errors when submitted
					setErrors(fieldErrors);
				} else {
					// When not submitted:
					// 1. Keep existing errors (fields that were previously invalid)
					// 2. Add new errors for currently touched fields
					setErrors((prevErrors) => {
						const newErrors = { ...prevErrors };

						// Update errors for all currently touched fields
						Object.keys(touchedFields).forEach((key) => {
							const fieldName = key as keyof T;

							if (touchedFields[fieldName]) {
								// If this touched field has a validation error, add it
								// If it's valid now, remove the error
								if (fieldErrors[fieldName]) {
									newErrors[fieldName] =
										fieldErrors[fieldName];
								} else {
									delete newErrors[fieldName];
								}
							}
						});

						return newErrors;
					});
				}
			}
		},
		[formValues, touchedFields, submitted, validate],
		debounceDelay,
	);

	return {
		errors,
		setErrors,
		submitted,
		setSubmitted,
		touchedFields,
		markFieldAsTouched,
	};
}
