import { useEffect, useState } from 'react';
import { translate } from '@/config/translate.setup';

export function useTranslation<const T extends readonly string[]>(keys: T) {
	type TranslationMap = Record<T[number], string>;

	const [translations, setTranslations] = useState<TranslationMap>(
		{} as TranslationMap,
	);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		let isMounted = true;

		(async () => {
			try {
				const results = await Promise.all(
					keys.map((key) => translate(key)),
				);

				if (!isMounted) return;

				const newTranslations = keys.reduce((acc, key, index) => {
					(acc as Record<string, string>)[key] = results[index];
					return acc;
				}, {} as TranslationMap);

				setTranslations(newTranslations);
				setIsLoading(false);
			} catch (error) {
				console.error('Failed to load translations:', error);
				if (isMounted) setIsLoading(false);
			}
		})();

		return () => {
			isMounted = false;
		};
	}, [keys]);

	return {
		translations,
		isTranslationLoading: isLoading,
	};
}
