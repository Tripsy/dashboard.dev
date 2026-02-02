export function capitalizeFirstLetter(str: string): string {
	return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
}

export function formatEnumLabel(value: string): string {
	return value
		.split('_')
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join(' ');
}

export function toKebabCase(
	str: string,
	options: {
		preserveCase?: boolean;
		preserveUnderscores?: boolean;
	} = {},
): string {
	const { preserveCase = false, preserveUnderscores = true } = options;

	let result = str;

	// Convert to lowercase unless preserveCase is true
	if (!preserveCase) {
		result = result.toLowerCase();
	}

	// Handle camelCase/PascalCase
	result = result.replace(/([a-z])([A-Z])/g, '$1-$2');

	// Replace spaces and (optionally) underscores with hyphens
	if (preserveUnderscores) {
		result = result.replace(/\s+/g, '-');
	} else {
		result = result.replace(/[\s_]+/g, '-');
	}

	// Remove special characters but keep hyphens and alphanumeric
	result = result.replace(/[^a-zA-Z0-9-]/g, '');

	// Clean up multiple hyphens
	result = result.replace(/-+/g, '-');

	// Remove leading/trailing hyphens
	result = result.replace(/^-+|-+$/g, '');

	return result;
}

export function toTitleCase(str: string): string {
	return str
		.replace(/[_-]/g, ' ')
		.split(' ')
		.map((word) => {
			if (!word) {
				return '';
			}

			// Capitalize the first letter, lowercase the rest
			return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
		})
		.join(' ')
		.replace(/\s+/g, ' ')
		.trim();
}

export function formatCurrency(
	value: number,
	currency: string = 'USD',
): string {
	return value.toLocaleString('en-US', {
		style: 'currency',
		currency: currency,
	});
}

/**
 * Replace variables in a string
 * Ex variables: {{key}}, {{Key}}, {{sub_key}}, {{key1}}
 *
 * @param {string} content - The string to replace template variables in
 * @param {Record<string, string>} vars - The template variables to replace
 * @returns {string} - The string with template variables replaced
 */
export function replaceVars(
	content: string,
	vars: Record<string, string> = {},
): string {
	return content.replace(/{{\s*(\w+)\s*}}/g, (_, key) =>
		key in vars ? vars[key] : `{{${key}}}`,
	);
}

/**
 * Build a query string from an object
 *
 * @param {Record<string, string | number | boolean | undefined | null>} params - The object to build the query string from
 * @returns {string} - The query string
 */
export const buildQueryString = (
	params: Record<string, string | number | boolean | undefined | null>,
): string => {
	const query = new URLSearchParams();

	Object.entries(params).forEach(([key, value]) => {
		if (value !== undefined && value !== null) {
			query.append(key, String(value));
		}
	});

	return query.toString();
};

export function parseJson(val: unknown) {
	if (typeof val === 'string') {
		if (val.trim() === '') {
			return {};
		}

		try {
			return JSON.parse(val);
		} catch {
			return {};
		}
	}

	return val;
}
