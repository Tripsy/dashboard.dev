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

	const [suggestions, setSuggestions] = useState<string[]>(suggestionList);

	const onSearch = useCallback(
		(query: string) => {
			if (!query.trim()) {
				setSuggestions(suggestionList);
				return;
			}

			const compareQuery = caseSensitive ? query : query.toLowerCase();

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
		onSearch,
		resetSuggestions,
	};
}
