import clsx from 'clsx';
import type { JSX } from 'react';

export const FormError = ({
	children,
	className,
}: {
	children: JSX.Element;
	className?: string;
}): JSX.Element | null => (
	<div className={clsx('form-error', className)}>{children}</div>
);
