import { useEffect, useLayoutEffect, useState } from 'react';
import { translate, translateLoaded } from '@/config/translate.setup';

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

	/*
	 * Fill in from the already-loaded locale resource before the browser paints, so a
	 * consumer doesn't render one empty frame on every client-side navigation.
	 *
	 * Deliberately a layout effect rather than a `useState` initializer: seeding during
	 * render would make the client's first pass disagree with the server HTML (which can
	 * never have the resource) and trip a hydration mismatch. On the very first load the
	 * cache is cold, so this is a no-op and the async effect below still does the work.
	 */
	useLayoutEffect(() => {
		const seeded = {} as TranslationMap;

		for (const key of keys) {
			const value = translateLoaded(key);

			if (value === null) {
				return;
			}

			(seeded as Record<string, string>)[key] = value;
		}

		setState({ translations: seeded, isLoading: false });
	}, [keys]);

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
