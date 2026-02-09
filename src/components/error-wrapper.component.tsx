import { CircleX } from 'lucide-react';
import type React from 'react';
import type { JSX } from 'react';
import { cn } from '@/helpers/css.helper';

export const ErrorIcon = ({
	className,
}: {
	className?: string;
}): JSX.Element => <CircleX className={cn('inline-block', className)} />;

type ErrorWrapperProps = {
	children?: React.ReactNode;
	title?: string;
	description?: string;
};

export function ErrorWrapperComponent({
	children,
	title = 'An error occurred!',
	description = 'Something went wrong!',
}: ErrorWrapperProps) {
	return (
		<div className="min-h-[calc(80vh-4rem)] flex items-center justify-center px-4 py-12">
			<div className="w-full max-w-md">
				<div className="text-center">
					<div className="flex justify-center mb-4">
						<ErrorIcon className="w-12 h-12 text-error bg-error-light rounded-full p-3" />
					</div>
					<h1 className="text-2xl font-bold mb-8">{title}</h1>
					<p className="text-muted-foreground">{description}</p>
				</div>
				{children}
			</div>
		</div>
	);
}
