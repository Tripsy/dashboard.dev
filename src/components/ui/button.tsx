import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { cn } from '@/helpers/css.helper';

const buttonVariants = cva(
	'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md h-fit font-medium cursor-pointer ' +
		'ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
	{
		variants: {
			variant: {
				default:
					'bg-primary text-primary-foreground hover:bg-primary/90',
				outline:
					'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
				secondary:
					'bg-secondary text-secondary-foreground hover:bg-secondary/80',
				ghost: 'hover:bg-accent hover:text-accent-foreground',
				error: 'bg-error text-error-foreground hover:bg-error/80',
				success:
					'bg-success text-success-foreground hover:bg-success/90',
				warning:
					'bg-warning text-warning-foreground hover:bg-warning/90',
				info: 'bg-info text-info-foreground hover:bg-info/90',
			},
			hover: {
				success:
					'hover:bg-success/90 hover:text-success-foreground hover:border-transparent',
				error: 'hover:bg-error/80 hover:text-error-foreground hover:border-transparent',
				info: 'hover:bg-info/90 hover:text-info-foreground hover:border-transparent',
				warning:
					'hover:bg-warning/70 hover:text-warning-foreground hover:border-transparent',
			},
			size: {
				xs: 'text-xs px-2 py-1.5',
				sm: 'text-sm p-2',
				md: 'px-4 py-2',
				lg: 'px-8',
			},
		},
		defaultVariants: {
			variant: 'default',
			size: 'md',
		},
	},
);

export type ButtonVariant = VariantProps<typeof buttonVariants>['variant'];
export type ButtonSize = VariantProps<typeof buttonVariants>['size'];
export type ButtonHover = VariantProps<typeof buttonVariants>['hover'];

export interface ButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof buttonVariants> {
	asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	({ className, variant, size, hover, asChild = false, ...props }, ref) => {
		const Comp = asChild ? Slot : 'button';
		return (
			<Comp
				className={cn(
					buttonVariants({ variant, size, hover, className }),
				)}
				ref={ref}
				{...props}
			/>
		);
	},
);
Button.displayName = 'Button';

export { Button, buttonVariants };
