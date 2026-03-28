import { useEffect, useMemo, useState } from 'react';

export type UseLocalAutocompleteOptions<T> = {
	source: T[];
	filter?: (item: T, query: string) => boolean;
	minLength?: number;
};

export function useLocalAutocomplete<T>({
	source,
	filter,
	minLength = 1,
}: UseLocalAutocompleteOptions<T>) {
	const [query, setQuery] = useState('');

	const defaultFilter = (item: T, q: string) => {
		if (typeof item === 'string') {
			return item.toLowerCase().includes(q.toLowerCase());
		}

		return false;
	};

	const activeFilter = filter ?? defaultFilter;

	const suggestions = useMemo(() => {
		if (!query) {
			return source;
		}

		if (query.length < minLength) {
			return [];
		}

		return source.filter((item) => activeFilter(item, query));
	}, [source, query, minLength, activeFilter]);

	// Keep suggestions in sync if source changes
	useEffect(() => {
		// no-op but ensures recompute if source updates
	}, [source]);

	return {
		query,
		setQuery,
		suggestions,
	};
}
