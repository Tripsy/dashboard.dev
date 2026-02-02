import clsx from 'clsx';
import type { JSX } from 'react';

export const FormPart = ({
	children,
	className,
}: {
	children: JSX.Element;
	className?: string;
}): JSX.Element | null => (
	<div className={clsx('form-part', className)}>{children}</div>
);
