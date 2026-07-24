'use client';

import type { EmailUpdateFormValuesType } from '@/app/(public)/account/email-update/email-update.definition';
import { FormComponentEmail } from '@/components/form/form-element.component';
import { useElementIds } from '@/hooks/use-element-ids.hook';
import { useWindowForm } from '@/providers/window-form.provider';

export function FormManageEmailUpdate() {
	const { formValues, errors, handleChange, pending } =
		useWindowForm<EmailUpdateFormValuesType>();

	const elementIds = useElementIds(['emailNew'] as const);

	return (
		<FormComponentEmail<EmailUpdateFormValuesType>
			labelText="New Email"
			id={elementIds.emailNew}
			fieldName="email_new"
			fieldValue={formValues.email_new ?? ''}
			disabled={pending}
			onChange={(e) => handleChange('email_new', e.target.value)}
			error={errors.email_new}
		/>
	);
}
