import { Loader2 } from 'lucide-react';
import { cn } from '@/helpers/css.helper';

export function LoadingIcon({ className }: { className?: string }) {
	return (
		<Loader2
			className={cn('animate-spin h-6 w-6', className)}
			aria-label="Loading"
		/>
	);
}

type LoadingProps = {
	text: string;
	className?: string;
};

export function Loading({ text, className }: LoadingProps) {
	return (
		<div className={className}>
			<span className="loading loading-ring loading-xl mr-2"></span>
			<span>{text}</span>
		</div>
	);
}
