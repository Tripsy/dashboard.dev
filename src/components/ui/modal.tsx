import { X } from 'lucide-react';
import type React from 'react';
import { useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/helpers/css.helper';

const sizeClasses = {
	sm: 'max-w-sm',
	md: 'max-w-md',
	lg: 'max-w-lg',
	xl: 'max-w-xl',
};

export type ModalSizeType = keyof typeof sizeClasses;

interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
	title?: string;
	description?: string;
	children: React.ReactNode;
	footer?: React.ReactNode;
	size?: ModalSizeType;
	closeOnBackdrop?: boolean;
	closeOnEscape?: boolean;
}

export function Modal({
	isOpen,
	onClose,
	title,
	description,
	children,
	footer,
	size = 'md',
	closeOnBackdrop = true,
	closeOnEscape = true,
}: ModalProps) {
	const handleEscape = useCallback(
		(e: KeyboardEvent) => {
			if (e.key === 'Escape' && closeOnEscape) {
				onClose();
			}
		},
		[onClose, closeOnEscape],
	);

	useEffect(() => {
		if (isOpen) {
			document.addEventListener('keydown', handleEscape);
			document.body.style.overflow = 'hidden';
		}

		return () => {
			document.removeEventListener('keydown', handleEscape);
			document.body.style.overflow = '';
		};
	}, [isOpen, handleEscape]);

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
			{/* Backdrop */}
			<div
				className="absolute inset-0 bg-foreground/20 backdrop-blur-sm animate-fade-in"
				onClick={closeOnBackdrop ? onClose : undefined}
				aria-hidden="true"
			/>

			{/* Modal content */}
			<div
				role="dialog"
				aria-modal="true"
				aria-labelledby={title ? 'modal-title' : undefined}
				aria-describedby={description ? 'modal-description' : undefined}
				className={cn(
					'relative w-full bg-card rounded-xl shadow-xl border border-border animate-scale-in',
					sizeClasses[size],
				)}
			>
				{/* Header */}
				{(title || description) && (
					<div className="px-6 pt-6 pb-0">
						{title && (
							<h2
								id="modal-title"
								className="text-lg font-semibold text-card-foreground"
							>
								{title}
							</h2>
						)}
						{description && (
							<p
								id="modal-description"
								className="text-sm text-muted-foreground mt-1"
							>
								{description}
							</p>
						)}
					</div>
				)}

				{/* Close button */}
				<Button
					variant="ghost"
					className="absolute right-4 top-4 h-8 w-8 rounded-full"
					onClick={onClose}
					aria-label="Close modal"
				>
					<X className="h-4 w-4" />
				</Button>

				{/* Body */}
				<div className="px-6 py-6">{children}</div>

				{/* Footer */}
				{footer && (
					<div className="px-6 pb-6 pt-0 flex justify-end gap-3">
						{footer}
					</div>
				)}
			</div>
		</div>
	);
}
