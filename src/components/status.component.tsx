import type React from 'react';
import { Icons } from '@/components/icon.component';
import { cn } from '@/helpers/css.helper';

type StatusProps = {
	children?: React.ReactNode;
	title?: string;
	description?: string;
};

// Loading

export function LoadingIcon({ className }: { className?: string }) {
	return (
		<Icons.Status.Loading
			className={cn('animate-spin h-6 w-6', className)}
			aria-label="Loading"
		/>
	);
}

export function LoadingContent({
	children,
	title = 'Loading',
	description = 'Please wait ...',
}: StatusProps) {
	return (
		<div className="flex items-center justify-center w-full px-4 py-12 ">
			<div className="text-center">
				<div className="flex justify-center mb-4">
					<LoadingIcon className="w-12 h-12 text-warning bg-warning/10 rounded-full p-3" />
				</div>
				<h1 className="text-2xl font-bold mb-8">{title}</h1>
				<p className="text-muted-foreground">{description}</p>
			</div>
			{children}
		</div>
	);
}

export function LoadingComponent({
	children,
	title = 'Loading',
	description = 'Please wait ...',
}: StatusProps) {
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

export function ErrorComponent({
	children,
	title = 'An error occurred!',
	description = 'Something went wrong!',
}: StatusProps) {
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

export function SuccessComponent({
	children,
	title = 'Success!',
	description = 'It&apos;s done!',
}: StatusProps) {
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

// Info

export function InfoComponent({
	children,
	title = 'Info!',
	description = 'Life is life!',
}: StatusProps) {
	return (
		<div className="min-h-[calc(80vh-4rem)] flex items-center justify-center px-4 py-12">
			<div className="w-full max-w-md">
				<div className="text-center">
					<div className="flex justify-center mb-4">
						<Icons.Info className="w-12 h-12 text-info bg-info/30 rounded-full p-3" />
					</div>
					<h1 className="text-2xl font-bold mb-8">{title}</h1>
					<p className="text-muted-foreground">{description}</p>
				</div>
				{children}
			</div>
		</div>
	);
}
