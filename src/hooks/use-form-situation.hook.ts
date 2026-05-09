import { useCallback, useRef, useState } from 'react';
import type {
	FormErrorsType,
	FormSituationType,
	FormValuesType,
} from '@/types/form.type';

export function useFormSituation<
	FormValues extends FormValuesType,
	FormSituation extends string | null = FormSituationType,
>(stateSituation: FormSituation, stateMessage: string | null) {
	const [formSituation, setFormSituation] = useState<
		FormSituation | FormSituationType
	>(stateSituation);
	const [formMessage, setFormMessage] = useState<string | null>(stateMessage);

	const prevStateRef = useRef({
		situation: stateSituation,
		message: stateMessage,
	});

	if (
		prevStateRef.current.situation !== stateSituation ||
		prevStateRef.current.message !== stateMessage
	) {
		prevStateRef.current = {
			situation: stateSituation,
			message: stateMessage,
		};
		setFormSituation(stateSituation);
		setFormMessage(stateMessage);
	}

	const handleValidation = useCallback(
		(errors: FormErrorsType<FormValues>) => {
			const hasErrors = Object.keys(errors ?? {}).length > 0;

			if (hasErrors) {
				setFormSituation('failedValidation');
				setFormMessage(
					`${Object.keys(errors).length} field(s) need attention`,
				);
			} else {
				setFormSituation((prev) =>
					prev === 'failedValidation' ? null : prev,
				);
				setFormMessage((prev) => (prev === stateMessage ? null : prev));
			}
		},
		[stateMessage],
	);

	return {
		formSituation,
		formMessage,
		handleValidation,
	};
}
