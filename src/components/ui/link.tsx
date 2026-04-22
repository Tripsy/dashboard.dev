import { Slot } from '@radix-ui/react-slot';
import type { VariantProps } from 'class-variance-authority';
import NextLink from 'next/link';
import * as React from 'react';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/helpers/css.helper';

const linkVariants = buttonVariants;

// export type LinkVariant = VariantProps<typeof linkVariants>['variant'];
// export type LinkSize = VariantProps<typeof linkVariants>['size'];
// export type LinkHover = VariantProps<typeof linkVariants>['hover'];

export interface LinkProps
	extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>,
		VariantProps<typeof linkVariants> {
	asChild?: boolean;
	href: string;
	external?: boolean;
	prefetch?: boolean;
}

const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
	(
		{
			className,
			variant,
			size,
			hover,
			asChild = false,
			href,
			external = false,
			prefetch = true,
			children,
			...props
		},
		ref,
	) => {
		const Comp = asChild ? Slot : 'a';

		// External link props
		const externalProps = external
			? {
					target: '_blank',
					rel: 'noopener noreferrer',
				}
			: {};

		// If external or asChild, use regular anchor
		if (external || asChild) {
			return (
				<Comp
					className={cn(
						linkVariants({ variant, size, hover, className }),
					)}
					href={href}
					ref={ref}
					{...externalProps}
					{...props}
				>
					{children}
				</Comp>
			);
		}

		// Internal Next.js link
		return (
			<NextLink
				href={href}
				prefetch={prefetch}
				className={cn(
					linkVariants({ variant, size, hover, className }),
				)}
				ref={ref}
				{...props}
			>
				{children}
			</NextLink>
		);
	},
);

Link.displayName = 'Link';

export { Link, linkVariants };
