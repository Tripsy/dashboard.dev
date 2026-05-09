import type { JSX } from 'react';
import { Icons } from '@/components/icon.component';
import type { FormSituationType } from '@/types/form.type';

export const FormError = <
	FormSituation extends string | null = FormSituationType,
>({
	formSituation,
	formMessage,
}: {
	formSituation: FormSituation;
	formMessage: string | null;
}): JSX.Element | null => {
	if (!formSituation || formSituation === 'success') {
		return null;
	}

	return (
		<div className="form-error">
			<div className="flex items-center gap-1.5 mb-2">
				<Icons.Status.Error />
				<div>{formMessage}</div>
			</div>
		</div>
	);
};
