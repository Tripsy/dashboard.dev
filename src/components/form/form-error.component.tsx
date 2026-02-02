import clsx from 'clsx';
import type { JSX } from 'react';
import { FormPart } from '@/components/form/form-part.component';

export const FormError = ({
	children,
	className,
}: {
	children: JSX.Element;
	className?: string;
}): JSX.Element | null => (
	<FormPart>
		<div className={clsx('form-error', className)}>{children}</div>
	</FormPart>
);
