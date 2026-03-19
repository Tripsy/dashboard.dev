import type React from 'react';
import sanitizeHtml from 'sanitize-html';
import { z } from 'zod';

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

export function createHandleChange<Fields>(
	setFormValues: React.Dispatch<React.SetStateAction<Fields>>,
	markFieldAsTouched: (name: keyof Fields) => void,
) {
	return <K extends keyof Fields>(name: K, value: Fields[K]) => {
		setFormValues((prev) => ({
			...prev,
			[name]: value,
		}));
		markFieldAsTouched(name);
	};
}

/**
 * Checks if the provided IBAN (RO version) is valid.
 *
 * @param iban
 */
export function isValidIBAN(iban: string): boolean {
	const clean = iban.replace(/\s+/g, '').toUpperCase();

	// Must be exactly 24 chars
	if (!/^RO\d{2}[A-Z]{4}\d{16}$/.test(clean)) {
		return false;
	}

	const rearranged = clean.slice(4) + clean.slice(0, 4);

	let remainder = rearranged.replace(/[A-Z]/g, (char) =>
		(char.charCodeAt(0) - 55).toString(),
	);

	while (remainder.length > 2) {
		remainder =
			(parseInt(remainder.slice(0, 9), 10) % 97).toString() +
			remainder.slice(9);
	}

	return parseInt(remainder, 10) % 97 === 1;
}

/**
 * Checks if the provided postal code is valid.
 *
 * @param postalCode
 */
export function isValidPostalCode(postalCode: string): boolean {
	return /^[0-9]{6}$/.test(postalCode);
}

/**
 * Checks if the provided CNP is valid.
 *
 * @param cnp
 */
export function isValidCnp(cnp: string): boolean {
	return /^[0-9]{13}$/.test(cnp);
}

/**
 * Helper for validating IDs (must be number > 0)
 *
 * @param message Optional custom error message
 */
export function validateId(message: string) {
	return z
		.number({ message })
		.nullable()
		.refine((val) => val !== null && val > 0, {
			message,
		});
}

/**
 * Helper for validating strings
 *
 * @param message Optional custom error message
 */
export function validateString(message: string) {
	return z.string({ message }).trim().nonempty({ message });
}

/**
 * Helper for validating enums
 *
 * @param enumObj
 * @param message Optional custom error message
 */
export function validateEnum<T extends Record<string, string>>(
	enumObj: T,
	message: string,
) {
	return z.enum(enumObj, { message });
}

/**
 * Helper for validating numbers
 *
 * @param message
 * @param onlyPositive
 * @param allowDecimals
 */
export function validateNumber(
	message: string,
	onlyPositive = true,
	allowDecimals = false,
) {
	let schema = z.number({ message });

	if (onlyPositive) {
		schema = schema.positive({ message });
	}

	if (!allowDecimals) {
		schema = schema.int({ message });
	}

	return schema;
}

/**
 * Helper for validating passwords
 *
 * @param messages
 * @param options
 */
export function validatePassword(
	messages: {
		password_invalid: string;
		password_min: string;
		password_condition_capital_letter: string;
		password_condition_number: string;
		password_condition_special_character: string;
	},
	options: {
		minLength: number;
		requireUppercase?: boolean;
		requireNumber?: boolean;
		requireSpecial?: boolean;
	} = {
		minLength: 8,
		requireUppercase: true,
		requireNumber: true,
		requireSpecial: true,
	},
) {
	// Start with base string validation
	let schema = z.string(messages.password_invalid).min(options.minLength, {
		message: messages.password_min,
	});

	// Add refinements based on requirements
	if (options.requireUppercase) {
		schema = schema.refine((value) => /[A-Z]/.test(value), {
			message: messages.password_condition_capital_letter,
		});
	}

	if (options.requireNumber) {
		schema = schema.refine((value) => /[0-9]/.test(value), {
			message: messages.password_condition_number,
		});
	}

	if (options.requireSpecial) {
		schema = schema.refine(
			(value) => /[!@#$%^&*()_+{}[\]:;<>,.?~\\/-]/.test(value),
			{
				message: messages.password_condition_special_character,
			},
		);
	}

	return schema;
}
