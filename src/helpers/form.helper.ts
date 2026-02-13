import sanitizeHtml from 'sanitize-html';
import type { z } from 'zod';
import React from "react";

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

export function getNestedError<T>(
	errors: Partial<Record<keyof T, string[]>>,
	path: string,
): string[] | undefined {
	return errors[path as keyof T];
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
	markFieldAsTouched: (name: keyof Fields) => void
) {
	return <K extends keyof Fields>(
		name: K,
		value: Fields[K]
	) => {
		setFormValues(prev => ({
			...prev,
			[name]: value,
		}));
		markFieldAsTouched(name);
	};
}
