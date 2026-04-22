import type { JSX } from 'react';
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
	label?: string | JSX.Element; // Content text for the button
	icon?: string; // Icon displayed in the button along with the label
	title?: string; // Tooltip text for the button
};
