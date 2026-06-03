export function capitalizeFirstLetter(str: string): string {
	return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
}

export function formatEnumLabel(value: string): string {
	return value
		.split('_')
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join(' ');
}

/**
 * Convert a string to kebab-case
 *
 * toKebabCase("hello world")           // "hello-world"
 * toKebabCase("HelloWorld")             // "hello-world"
 * toKebabCase("helloWorld")             // "hello-world"
 * toKebabCase("hello_world")            // "hello_world"
 * toKebabCase("hello__world")           // "hello__world"
 * toKebabCase("Hello World!")           // "hello-world"
 * toKebabCase("myVariableName")         // "my-variable-name"
 * toKebabCase("This is a test")         // "this-is-a-test"
 * toKebabCase("  leading trailing  ")   // "leading-trailing"
 *
 * toKebabCase("hello_world", { preserveUnderscores: false })   // "hello-world"
 * toKebabCase("hello__world", { preserveUnderscores: false })  // "hello-world"
 * toKebabCase("hello_world test", { preserveUnderscores: false }) // "hello-world-test"
 *
 * toKebabCase("HelloWorld", { preserveCase: true })     // "Hello-World" (keeps case)
 * toKebabCase("myXMLParser", { preserveCase: true })    // "my-XML-Parser"
 * toKebabCase("HelloWorld", { preserveCase: true, preserveUnderscores: false }) // "Hello-World"
 */
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

/**
 * Convert a string to title case
 * Ex: 'cash-flow' → 'Cash Flow'
 */
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

/**
 * Convert a string to camelCase (or PascalCase if capitalizeFirst is true)
 * Ex: 'cash-flow' → 'cashFlow'
 * Ex: 'cash-flow' with capitalizeFirst: true → 'CashFlow'
 */
export function toCamelCase(
	str: string,
	options: { capitalizeFirst?: boolean } = {},
): string {
	const { capitalizeFirst = false } = options;

	return str
		.replace(/[_-]/g, ' ')
		.split(' ')
		.map((word, index) => {
			if (!word) return '';

			// If capitalizeFirst is true, capitalize even the first word
			if (capitalizeFirst) {
				return (
					word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
				);
			}

			// Default behavior: first word lowercase, rest capitalized
			return index === 0
				? word.toLowerCase()
				: word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
		})
		.join('');
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

/**
 * Formats an amount
 *
 * @param amount
 * @param currencyCode
 */
export function formatAmount(amount: number, currencyCode: string) {
	const numberFormatter = new Intl.NumberFormat(undefined, {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	});

	const symbolFormatter = new Intl.NumberFormat(undefined, {
		style: 'currency',
		currency: currencyCode,
		currencyDisplay: 'narrowSymbol',
	});

	const parts = symbolFormatter.formatToParts(0);
	const currency =
		parts.find((part) => part.type === 'currency')?.value ?? currencyCode;

	return {
		value: numberFormatter.format(amount),
		currency,
	};
}

export function normalizePhoneNumber(
	number: string,
	defaultCountryCode: string = '40',
): string {
	let digits = number.replace(/\D/g, '');

	// Already in international format
	if (number.trimStart().startsWith('+')) {
		return digits;
	}

	// International prefix (00...)
	if (digits.startsWith('00')) {
		return digits.substring(2);
	}

	// Has enough digits to already include a country code
	if (digits.length > 10) {
		return digits;
	}

	// Local number — strip trunk prefix (leading 0) and add country code
	if (digits.startsWith('0')) {
		digits = digits.substring(1);
	}

	return defaultCountryCode + digits;
}

export function whatsAppUrl(number: string, text: string) {
	// Remove any non-numeric characters from the number and ensure no '+' sign
	const cleanNumber = normalizePhoneNumber(number);

	// Encode the text for URL
	const encodedText = encodeURIComponent(text);

	// Build the WhatsApp URL
	let whatsappUrl: string;

	if (cleanNumber) {
		// Share to specific number
		whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodedText}`;
	} else {
		// Share without specific number (just pre-filled message)
		whatsappUrl = `https://wa.me/?text=${encodedText}`;
	}

	return whatsappUrl;
}
