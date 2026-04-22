import { useEffect, useState } from 'react';
import { translate } from '@/config/translate.setup';

export function useTranslation<const T extends readonly string[]>(keys: T) {
	type TranslationMap = Record<T[number], string>;

	type TranslationState = {
		translations: TranslationMap;
		isLoading: boolean;
	};

	const [state, setState] = useState<TranslationState>({
		translations: {} as TranslationMap,
		isLoading: true,
	});

	useEffect(() => {
		let isMounted = true;

		(async () => {
			try {
				const results = await Promise.all(
					keys.map((key) => translate(key)),
				);

				if (!isMounted) {
					return;
				}

				const translations = keys.reduce((acc, key, index) => {
					(acc as Record<string, string>)[key] = results[index];
					return acc;
				}, {} as TranslationMap);

				setState({ translations, isLoading: false });
			} catch (error) {
				console.error('Failed to load translations:', error);
				if (isMounted)
					setState((prev) => ({ ...prev, isLoading: false }));
			}
		})();

		return () => {
			isMounted = false;
		};
	}, [keys]);

	return {
		translations: state.translations,
		isTranslationLoading: state.isLoading,
	};
}
