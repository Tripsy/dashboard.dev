import type {
	ButtonHover,
	ButtonSize,
	ButtonVariant,
} from '@/components/ui/button';

export type ActionButtonPropsType = {
	className?: string;
	variant?: ButtonVariant;
	size?: ButtonSize;
	hover?: ButtonHover;
	icon?: string;
	label?: string;
};
