import { useId } from 'react';

export function useElementIds(fields: string[]) {
	const id = useId();

	return fields.reduce(
		(acc: Record<string, string>, field: string) => {
			acc[field] = `id-${field}-${id}`;

			return acc;
		},
		{} as Record<string, string>,
	);
}
