import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useDebouncedEffect } from '@/hooks/index';

interface UseSearchFilterOptions {
	initialValue?: string;
	debounceDelay?: number;
	minLength?: number;
	onSearch?: (value: string) => void;
}

export function useSearchFilter(options: UseSearchFilterOptions = {}) {
	const {
		initialValue = '',
		debounceDelay = 500,
		minLength = 3,
		onSearch,
	} = options;

	const [value, setValue] = useState(initialValue);
	const initialValueRef = useRef(initialValue);
	const currentValueRef = useRef(initialValue);
	const debouncedValueRef = useRef('');
	const triggerSearchRef = useRef(false);
	const isSyncRef = useRef(true);

	// Sync when initialValue changes from outside (like `reset`)
	useEffect(() => {
		if (isSyncRef.current) {
			setValue(initialValue);

			currentValueRef.current = initialValue;
			initialValueRef.current = initialValue;
		}

		isSyncRef.current = true;
	}, [initialValue]);

	const handler = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const value = e.target.value;

			setValue(value);

			currentValueRef.current = value;

			// Determine if we should trigger search
			triggerSearchRef.current =
				value.length >= minLength ||
				(initialValueRef.current.length >= minLength &&
					value.length < minLength);

			// Determine if we should disable value sync
			isSyncRef.current = !(
				initialValueRef.current.length >= minLength &&
				value.length < minLength
			);

			debouncedValueRef.current = value.length < minLength ? '' : value;
		},
		[minLength],
	);

	// Handle the debounced search
	useDebouncedEffect(
		() => {
			if (triggerSearchRef.current && onSearch) {
				onSearch(debouncedValueRef.current);

				initialValueRef.current = currentValueRef.current;
				triggerSearchRef.current = false;
			}
		},
		[value],
		debounceDelay,
	);

	const onReset = useCallback(() => {
		setValue('');
		isSyncRef.current = true;
		currentValueRef.current = '';
		initialValueRef.current = '';
		debouncedValueRef.current = '';
	}, []);

	return {
		value,
		handler,
		isSearching: triggerSearchRef.current,
		onReset: onReset,
	};
}
