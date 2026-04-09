import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
	type DataSourceKey,
	getDataSourceConfig,
} from '@/config/data-source.config';
import ValueError from '@/exceptions/value.error';
import type {
	WindowConfig,
	WindowCreateConfig,
	WindowDefinition,
} from '@/types/window.type';

type WindowStore = {
	stack: WindowConfig[];
	create: (config: WindowCreateConfig) => string; // Adds to stack, visible, top
	replace: (config: WindowCreateConfig, uid?: string) => string; // Replace existing window
	close: (uid?: string) => void; // Removes from stack
	closeAll: () => void; // Clear stack
	minimize: (uid: string) => void; // Still in stack, hidden
	focus: (uid: string) => void; // Still in stack, visible, top
	restore: (uid: string) => void; // Still in stack, visible again
	getWindow: (uid: string) => WindowConfig | undefined; // Get window by uid
	getCurrentWindow: () => WindowConfig | undefined; // Get top window
};

export const useModalStore = create<WindowStore>()(
	devtools((set, get) => {
		// Private helper to check if window exists
		const windowExists = (uid: string): boolean => {
			return get().stack.some((window) => window.uid === uid);
		};

		// Private helper to get focused (top) window
		const getFocusedWindow = (): WindowConfig | undefined => {
			const stack = get().stack;

			return stack[stack.length - 1];
		};

		// Private helper to find window index
		const findWindowIndex = (uid: string): number => {
			return get().stack.findIndex((window) => window.uid === uid);
		};

		// Private helper to prepare config on create
		const prepareConfigOnCreate = (
			config: WindowCreateConfig,
		): WindowConfig => {
			const enrichedConfig = { ...config };

			switch (enrichedConfig.section) {
				case 'dashboard': {
					const actions = getDataSourceConfig(
						enrichedConfig.key as DataSourceKey,
						'actions',
					);

					if (!actions) {
						throw new ValueError(
							`Actions not defined for ${enrichedConfig.key}`,
						);
					}

					const actionConfig = actions[enrichedConfig.action];

					if (!actionConfig) {
						throw new ValueError(
							`Action "${enrichedConfig.action}" not defined for ${enrichedConfig.key}`,
						);
					}

					// Create definition object
					const definition: WindowDefinition = {
						windowType: actionConfig.windowType,
						windowComponent: actionConfig.windowComponent,
						entriesSelection: actionConfig.entriesSelection,
						operationFunction: actionConfig.operationFunction,
						button: actionConfig.button,
						validateForm: actionConfig.validateForm,
						getFormValues: actionConfig.getFormValues,
						getFormState: actionConfig.getFormState,
					};

					// Return complete WindowConfig with definition
					return {
						...enrichedConfig,
						definition,
						props: {
							...actionConfig.windowConfigProps,
							...enrichedConfig.props,
						},
						minimized: false,
					};
				}
				default:
					throw new Error(
						`Invalid section: ${enrichedConfig.section}`,
					);
			}
		};

		const createWindow = (config: WindowCreateConfig): void => {
			// Check if window with same UID already exists
			if (windowExists(config.uid)) {
				console.warn(
					`Window with uid "${config.uid}" already exists. Use update() or replace() instead.`,
				);
			}

			const preparedConfig = prepareConfigOnCreate(config);

			set((state) => ({
				stack: [...state.stack, preparedConfig],
			}));
		};

		return {
			stack: [],

			create: (config) => {
				createWindow(config);

				return config.uid;
			},

			replace: (config, uid) => {
				// Determine which window to remove
				let targetIndex: number;

				if (uid) {
					// Replace specific window by UID
					targetIndex = findWindowIndex(uid);

					if (targetIndex === -1) {
						// console.warn(`Window with uid "${uid}" not found. Creating new window instead.`);
						createWindow(config);

						return config.uid;
					}
				} else {
					// Replace focused (top) window
					const focusedWindow = getFocusedWindow();
					if (!focusedWindow) {
						// console.warn('No focused window to replace. Creating new window instead.');
						createWindow(config);

						return config.uid;
					}

					targetIndex = get().stack.length - 1;
				}

				const preparedConfig = prepareConfigOnCreate(config);

				set((state) => {
					// Remove the old window and insert the new one at the same position
					const updatedStack = [...state.stack];

					updatedStack.splice(targetIndex, 1, preparedConfig);

					return { stack: updatedStack };
				});

				return preparedConfig.uid;
			},

			close: (uid) =>
				set((state) => ({
					stack: uid
						? state.stack.filter((m) => m.uid !== uid) // close specific
						: state.stack.slice(0, -1), // close top
				})),

			closeAll: () => set({ stack: [] }),

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

			// Get window by uid
			getWindow: (uid) => {
				return get().stack.find((window) => window.uid === uid);
			},

			// Get current/top window
			getCurrentWindow: () => {
				return getFocusedWindow();
			},
		};
	}),
);
