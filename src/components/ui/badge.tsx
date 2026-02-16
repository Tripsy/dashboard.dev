import { cva, type VariantProps } from 'class-variance-authority';
import type * as React from 'react';
import { cn } from '@/helpers/css.helper';

const badgeVariants = cva(
	'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md h-fit font-semibold' +
		'transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
	{
		variants: {
			variant: {
				default: 'bg-primary text-primary-foreground',
				secondary: 'bg-secondary text-secondary-foreground',
				success: 'bg-success text-success-foreground',
				warning: 'bg-warning text-warning-foreground',
				info: 'bg-info text-info-foreground',
				error: 'bg-error text-error-foreground',
			},
			size: {
				md: 'px-4 py-2',
				xs: 'text-xs px-2 py-1.5',
				sm: 'text-sm p-2',
				lg: 'px-8',
				status: 'text-sm px-2 py-1.5',
			},
		},
		defaultVariants: {
			variant: 'default',
			size: 'md',
		},
	},
);

export type BadgeVariant = VariantProps<typeof badgeVariants>['variant'];
export type BadgeSize = VariantProps<typeof badgeVariants>['size'];

export interface BadgeProps
	extends React.HTMLAttributes<HTMLDivElement>,
		VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
	return (
		<div
			className={cn(badgeVariants({ variant, size }), className)}
			{...props}
		/>
	);
}

export { Badge, badgeVariants };
