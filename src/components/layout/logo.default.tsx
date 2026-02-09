import { cn } from '@/helpers/css.helper';

export function LogoComponent({
	divClass,
	spanClass,
}: {
	divClass?: string;
	spanClass?: string;
}) {
	return (
		<div
			className={cn(
				'flex h-12 w-12 items-center justify-center rounded-xl bg-primary',
				divClass,
			)}
		>
			<span
				className={cn(
					'text-2xl font-bold text-primary-foreground',
					spanClass,
				)}
			>
				N
			</span>
		</div>
	);
}
