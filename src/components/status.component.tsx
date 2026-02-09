import type React from 'react';
import { Icons } from '@/components/icon.component';
import { cn } from '@/helpers/css.helper';

// Loading

export function LoadingIcon({ className }: { className?: string }) {
	return (
		<Icons.Status.Loading
			className={cn('animate-spin h-6 w-6', className)}
			aria-label="Loading"
		/>
	);
}

type LoadingProps = {
	children?: React.ReactNode;
	title?: string;
	description?: string;
};

export function LoadingComponent({
	children,
	title = 'Loading',
	description = 'Please wait ...',
}: LoadingProps) {
	return (
		<div className="min-h-[calc(80vh-4rem)] flex items-center justify-center px-4 py-12">
			<div className="w-full max-w-md">
				<div className="text-center">
					<div className="flex justify-center mb-4">
						<LoadingIcon className="w-12 h-12 text-warning bg-warning/10 rounded-full p-3" />
					</div>
					<h1 className="text-2xl font-bold mb-8">{title}</h1>
					<p className="text-muted-foreground">{description}</p>
				</div>
				{children}
			</div>
		</div>
	);
}

// Error

export const ErrorIcon = ({ className }: { className?: string }) => (
	<Icons.Status.Error className={cn('inline-block', className)} />
);

type ErrorProps = {
	children?: React.ReactNode;
	title?: string;
	description?: string;
};

export function ErrorComponent({
	children,
	title = 'An error occurred!',
	description = 'Something went wrong!',
}: ErrorProps) {
	return (
		<div className="min-h-[calc(80vh-4rem)] flex items-center justify-center px-4 py-12">
			<div className="w-full max-w-md">
				<div className="text-center">
					<div className="flex justify-center mb-4">
						<ErrorIcon className="w-12 h-12 text-error bg-error/10 rounded-full p-3" />
					</div>
					<h1 className="text-2xl font-bold mb-8">{title}</h1>
					<p className="text-muted-foreground">{description}</p>
				</div>
				{children}
			</div>
		</div>
	);
}

// Success

type SuccessProps = {
	children?: React.ReactNode;
	title?: string;
	description?: string;
};

export function SuccessComponent({
	children,
	title = 'Success!',
	description = 'It&apos;s done!',
}: SuccessProps) {
	return (
		<div className="min-h-[calc(80vh-4rem)] flex items-center justify-center px-4 py-12">
			<div className="w-full max-w-md">
				<div className="text-center">
					<div className="flex justify-center mb-4">
						<Icons.Status.Success className="w-12 h-12 text-success bg-success/30 rounded-full p-3" />
					</div>
					<h1 className="text-2xl font-bold mb-8">{title}</h1>
					<p className="text-muted-foreground">{description}</p>
				</div>
				{children}
			</div>
		</div>
	);
}
