import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { ModalSizeType } from '@/components/ui/modal';
import type { BaseModelType, DataSourceKey } from '@/config/data-source.config';

export type OnSuccessActionType = (data: unknown) => void;

export type WindowConfig = {
	uid: string;
	dataSource: DataSourceKey; // TODO this has to be dropped
	actionName: string; // TODO rename to type
	actionEntries: BaseModelType[]; // TODO rename to entries
	prefillEntry?: Record<string, unknown>;
	onSuccess?: OnSuccessActionType; // TODO rename to onCreateSuccess -> and move to events
	props?: {
		size: ModalSizeType;
		minimized?: boolean;
		className?: string;

	};
};

type WindowStore = {
	stack: WindowConfig[];
	create: (config: WindowConfig) => void; // Adds to stack, visible, top
	close: (uid?: string) => void; // Removes from stack
	minimize: (uid: string) => void; // Still in stack, hidden
	focus: (uid: string) => void; // Still in stack, visible, top
	restore: (uid: string) => void; // Still in stack, visible again
	closeAll: () => void; // Clear stack
};


export const useModalStore = create<WindowStore>()(
	devtools((set) => ({
		isOpen: false,
		current: null,

		create: (config) =>
			set((state) => ({
				stack: [...state.stack, {
					...config,
					minimized: config?.props.minimized ?? false // Use provided value or default to false
				}],
			})),

		close: (uid) =>
			set((state) => ({
				stack: uid
					? state.stack.filter((m) => m.uid !== uid) // close specific
					: state.stack.slice(0, -1), // close top
			})),

		minimize: (uid) =>
			set((state) => ({
				stack: state.stack.map((m) =>
					m.uid === uid ? { ...m, minimized: true } : m,
				),
			})),

		focus: (uid) =>
			set((state) => {
				const modal = state.stack.find((m) => m.uid === uid);

				if (!modal) {
					return state;
				}

				return {
					stack: [
						...state.stack.filter((m) => m.uid !== uid),
						modal,
					],
				};
			}),

		restore: (uid) =>
			set((state) => ({
				stack: state.stack.map((m) =>
					m.uid === uid ? { ...m, minimized: false } : m,
				),
			})),

		closeAll: () => set({ stack: [] })
	})),
);

const createWindow = (config: WindowConfig): Window => ({
	...config,
	props: {
		...config.props,
		minimized: config.props?.minimized ?? false,
	},
});