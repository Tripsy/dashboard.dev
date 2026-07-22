import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { cn } from '@/helpers/css.helper';

// Styled with HeroUI v3 color tokens (accent = brand, danger = error, surface/default = neutrals).
// `default` maps to HeroUI `accent`; `secondary` maps to HeroUI `default` (neutral) per migration decision.
// success/info/warning have no native HeroUI button variant, so they are expressed directly via tokens.
const buttonVariants = cva(
	'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md h-fit font-medium cursor-pointer ' +
		'ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0',
	{
		variants: {
			variant: {
				default:
					'bg-accent text-accent-foreground hover:bg-accent-hover',
				outline:
					'border border-border bg-background hover:bg-surface-secondary hover:text-foreground',
				secondary:
					'bg-default text-default-foreground hover:bg-default-hover',
				ghost: 'hover:bg-surface-secondary hover:text-foreground',
				success:
					'bg-success text-accent-foreground hover:bg-success-hover',
				error: 'bg-danger text-danger-foreground hover:bg-danger-hover',
				warning:
					'bg-warning text-warning-foreground hover:bg-warning-hover',
			},
			hover: {
				success:
					'hover:bg-success/90 hover:text-accent-foreground hover:border-transparent',
				error: 'hover:bg-danger/80 hover:text-danger-foreground hover:border-transparent',
				warning:
					'hover:bg-warning/70 hover:text-warning-foreground hover:border-transparent',
				default:
					'hover:bg-accent hover:text-accent-foreground hover:border-transparent',
			},
			size: {
				xs: 'text-xs px-2 py-1.5',
				sm: 'text-sm p-2',
				md: 'h-10 px-4',
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
