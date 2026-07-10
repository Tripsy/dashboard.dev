import { useMemo } from 'react';
import { ActionButton } from '@/components/action-button.component';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { useTranslation } from '@/hooks/use-translation.hook';
import type { ButtonAppearanceType } from '@/types/html.type';

export type ConfirmationDialogProps = {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => void;
	title: string;
	description: string;
	buttonCancel?: ButtonAppearanceType;
	buttonConfirm?: ButtonAppearanceType;
	disabled: boolean;
};

export function ConfirmationDialog({
	isOpen,
	onClose,
	onConfirm,
	title,
	description,
	buttonCancel,
	buttonConfirm,
	disabled = false,
}: ConfirmationDialogProps) {
	const translationsKeys = useMemo(
		() =>
			[
				'app.action.abort.title',
				'app.action.abort.label',
				'app.action.confirm.title',
				'app.action.confirm.label',
			] as const,
		[],
	);

	const { translations } = useTranslation(translationsKeys);

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
					<DialogDescription className="mt-4">
						{description}
					</DialogDescription>
				</DialogHeader>
				<DialogFooter className="gap-2">
					<ActionButton
						action="abort"
						buttonAppearance={{
							...buttonCancel,
							variant: buttonCancel?.variant ?? 'outline',
							hover: buttonCancel?.hover ?? 'warning',
							title:
								buttonCancel?.title ??
								translations['app.action.abort.title'],
							icon: buttonCancel?.icon ?? 'abort',
							label:
								buttonCancel?.label ??
								translations['app.action.abort.label'],
						}}
						disabled={disabled}
						command={{
							type: 'action',
							onClick: onClose,
						}}
					/>
					<ActionButton
						action="confirm"
						buttonAppearance={{
							...buttonConfirm,
							variant: buttonConfirm?.variant ?? 'info',
							title:
								buttonCancel?.title ??
								translations['app.action.confirm.title'],
							icon: buttonCancel?.icon ?? 'confirm',
							label:
								buttonCancel?.label ??
								translations['app.action.confirm.label'],
						}}
						disabled={disabled}
						command={{
							type: 'action',
							onClick: onConfirm,
						}}
					/>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
