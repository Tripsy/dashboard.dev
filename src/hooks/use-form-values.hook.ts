import isEqual from 'fast-deep-equal';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import type { FormStateValuesType } from '@/config/data-source';

export function useFormValues<T extends FormStateValuesType>(
	stateValues: T,
): [T, React.Dispatch<React.SetStateAction<T>>] {
	const [formValues, setFormValues] = useState<T>(() => stateValues);

	const prevExternalValuesRef = useRef<T>(stateValues);

	useEffect(() => {
		if (
			stateValues &&
			!isEqual(prevExternalValuesRef.current, stateValues)
		) {
			setFormValues({ ...stateValues });

			prevExternalValuesRef.current = stateValues;
		}
	}, [stateValues]);

	return [formValues, setFormValues];
}
