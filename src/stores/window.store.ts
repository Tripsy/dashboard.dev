import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { ModalSizeType } from '@/components/ui/modal';
import type React from "react";

export type OnCreateSuccessType = (data: unknown) => void;
export type WindowEntryType = Record<string, unknown>;
export type WindowConfigPropsType = {
	title: string;
	size: ModalSizeType;
	className?: string;
};
export type WindowInterfaceType = 'dashboard' | 'public';
export type WindowModuleType = {
	interface: WindowInterfaceType;
	key: string; // Note: for interface `dashboard`, this is the DataSourceKey
	action: string;
};
export type WindowInstanceType = 'create' | 'update' | 'action' | 'view' | 'other';

// biome-ignore lint/suspicious/noExplicitAny: It's fine
export type WindowComponent = React.ComponentType<any>;

export type WindowConfig = {
	uid: string;
	minimized?: boolean;
	module: WindowModuleType;
	data?: {
		entries?: WindowEntryType[];
		prefillEntry?: WindowEntryType; // TODO: maybe drop this
		type: WindowInstanceType;
		component: WindowComponent; // Component to render in window
	}
	events?: {
		onCreateSuccess?: OnCreateSuccessType;
	};
	props: WindowConfigPropsType;
};

type WindowStore = {
	stack: WindowConfig[];
	definition: (module: WindowModuleType) => void; // Extract definitions // TODO maybe push them WindowConfig.data or WindowConfig.definition
	create: (config: WindowConfig) => void; // Adds to stack, visible, top
	close: (uid?: string) => void; // Removes from stack
	minimize: (uid: string) => void; // Still in stack, hidden
	focus: (uid: string) => void; // Still in stack, visible, top
	restore: (uid: string) => void; // Still in stack, visible again
	closeAll: () => void; // Clear stack
};

export const useModalStore = create<WindowStore>()(
	devtools((set) => ({
		definition: (module: WindowModuleType) => {

		},

		create: (config) =>
			set((state) => ({
				stack: [...state.stack, {
					...config,
					minimized: config.minimized ?? false // Use provided value or default to false
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

		// On restore should also get focus
		restore: (uid) =>
			set((state) => ({
				stack: state.stack.map((m) =>
					m.uid === uid ? { ...m, minimized: false } : m,
				),
			})),

		closeAll: () => set({ stack: [] })
	})),
);