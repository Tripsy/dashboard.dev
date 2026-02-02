import clsx from 'clsx';
import type { JSX } from 'react';

export const FormElementError = ({
	messages,
	className,
}: {
	messages?: string[];
	className?: string;
}): JSX.Element | null =>
	messages?.length ? (
		<div className={clsx('form-element-error', className)}>
			{messages.length === 1 ? (
				messages[0]
			) : (
				<ul>
					{messages.map((msg) => (
						<li key={msg}>- {msg}</li>
					))}
				</ul>
			)}
		</div>
	) : null;
