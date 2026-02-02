import type { AutoCompleteCompleteEvent } from 'primereact/autocomplete';
import { useCallback, useState } from 'react';

export interface UseAutocompleteOptions {
	filterMode?: 'includes' | 'startsWith';
	caseSensitive?: boolean;
}

export function useAutocomplete(
	suggestionList: string[],
	options: UseAutocompleteOptions = {},
) {
	const { filterMode = 'startsWith', caseSensitive = false } = options;

	const [suggestions, setSuggestions] = useState<string[]>([]);

	const completeMethod = useCallback(
		(event: AutoCompleteCompleteEvent) => {
			const currentQuery = event.query;

			if (!currentQuery.trim()) {
				setSuggestions(suggestionList);

				return;
			}

			const compareQuery = caseSensitive
				? currentQuery
				: currentQuery.toLowerCase();

			const filtered = suggestionList.filter((item) => {
				const compareItem = caseSensitive ? item : item.toLowerCase();

				if (filterMode === 'includes') {
					return compareItem.includes(compareQuery);
				}

				return compareItem.startsWith(compareQuery);
			});

			setSuggestions(filtered);
		},
		[suggestionList, filterMode, caseSensitive],
	);

	const resetSuggestions = useCallback(() => {
		setSuggestions(suggestionList);
	}, [suggestionList]);

	return {
		suggestions,
		completeMethod,
		resetSuggestions,
	};
}
