import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { ModalSizeType } from '@/components/ui/modal';
import type { BaseModelType, DataSourceKey } from '@/config/data-source.config';

export type ModalOnSuccess = (action: string) => void;

export type ModalConfig = {
	dataSource: DataSourceKey;
	actionName: string;
	actionEntry: BaseModelType | null;
	onSuccess?: ModalOnSuccess;
	props?: {
		size: ModalSizeType;
		className?: string;
	};
};

type ModalStore = {
	isOpen: boolean;
	current: ModalConfig | null;

	open: (config: ModalConfig) => void;
	close: () => void;
};

export const useModalStore = create<ModalStore>()(
	devtools((set) => ({
		isOpen: false,
		current: null,

		open: (config: ModalConfig) =>
			set({
				isOpen: true,
				current: config,
			}),

		close: () =>
			set({
				isOpen: false,
				current: null,
			}),

		replace: (config: ModalConfig) =>
			set({
				isOpen: true,
				current: config,
			}),
	})),
);
