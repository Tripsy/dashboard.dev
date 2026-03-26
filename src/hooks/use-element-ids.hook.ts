import { useId } from 'react';

export function useElementIds<T extends readonly string[]>(keys: T): Record<T[number], string> {
	const id = useId();

	return keys.reduce(
		(acc: Record<string, string>, field: string) => {
			acc[field] = `id-${field}-${id}`;

			return acc;
		},
		{},
	);
}
