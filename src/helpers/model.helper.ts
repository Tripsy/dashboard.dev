/**
 * Normalizes date fields in an object while preserving all other properties
 *
 * @param obj Object containing date strings
 * @param dateFields Array of date field names to normalize (default: ['created_at', 'updated_at'])
 */
export function normalizeDates<
	T extends Record<string, unknown>,
	K extends keyof T & string = keyof T & string,
>(
	obj: T | null,
	dateFields: string[] = ['created_at', 'updated_at'],
): { [P in keyof T]: P extends K ? Date : T[P] } | null {
	if (!obj) return null;

	const result = { ...obj };

	dateFields.forEach((field) => {
		if (field in result) {
			(result as Record<string, unknown>)[field] = new Date(
				result[field] as unknown as string,
			);
		}
	});

	return result as { [P in keyof T]: P extends K ? Date : T[P] };
}
