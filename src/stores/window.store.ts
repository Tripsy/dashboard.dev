import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
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
	open: (config: WindowCreateConfig, uid?: string) => string; // Replace existing window; create if not found
	close: (uid?: string) => void; // Removes from stack
	closeAll: () => void; // Clear stack
	minimize: (uid: string) => void; // Still in stack, hidden
	restore: (uid: string) => void; // Still in stack, visible again
	getWindow: (uid: string) => WindowConfig | undefined; // Get window by uid
	getCurrentWindow: () => WindowConfig | undefined; // Get top window
};

// Helper to prepare config on create
const prepareConfigOnCreate = (config: WindowCreateConfig): WindowConfig => {
	const enrichedConfig = { ...config };

	switch (enrichedConfig.section) {
		case 'dashboard': {
			const actions = getDataSourceConfig(
				enrichedConfig.dataSource as DataSourceKey,
				'actions',
			);

			if (!actions) {
				throw new ValueError(
					`Actions not defined for ${enrichedConfig.dataSource}`,
				);
			}

			const actionConfig = actions[enrichedConfig.action];

			if (!actionConfig) {
				throw new ValueError(
					`Action "${enrichedConfig.action}" not defined for ${enrichedConfig.dataSource}`,
				);
			}

			// Create definition object
			const definition: WindowDefinition = {
				windowType: actionConfig.windowType,
				windowTitle: actionConfig.windowTitle,
				windowComponent: actionConfig.windowComponent,
				entriesSelection: actionConfig.entriesSelection,
				operationFunction: actionConfig.operationFunction,
				button: actionConfig.button,
				validateForm: actionConfig.validateForm,
				getFormValues: actionConfig.getFormValues,
				getFormState: actionConfig.getFormState,
				displayEntryLabel: getDataSourceConfig(
					enrichedConfig.dataSource as DataSourceKey,
					'displayEntryLabel',
				),
			};

			// Return complete WindowConfig
			return {
				...enrichedConfig,
				definition,
				props: {
					...actionConfig.windowConfigProps,
					...enrichedConfig.props,
				},
				events: {
					...actionConfig.events,
					...enrichedConfig.events,
				},
				minimized: enrichedConfig.minimized ?? false,
			};
		}
		default:
			throw new Error(`Invalid section: ${enrichedConfig.section}`);
	}
};

export const useModalStore = create<WindowStore>()(
	devtools(
		persist(
			(set, get) => {
				// Private helper to check if window exists
				const windowExists = (uid: string): boolean => {
					return get().stack.some((window) => window.uid === uid);
				};

				// Private helper to get focused (top) window
				const getFocusedWindow = (): WindowConfig | undefined => {
					return get().stack.find((m) => !m.minimized);
				};

				const minimizeAll = (stack: WindowConfig[]): WindowConfig[] =>
					stack.map((m) =>
						m.minimized ? m : { ...m, minimized: true },
					);

				return {
					stack: [],

					open: (config, uid) => {
						const targetUid = uid ?? getFocusedWindow()?.uid;
						const preparedConfig = prepareConfigOnCreate(config);

						// No target found — treat as a new window
						if (!targetUid || !windowExists(targetUid)) {
							set((state) => ({
								stack: [
									...minimizeAll(state.stack),
									preparedConfig,
								],
							}));

							return config.uid;
						}

						set((state) => ({
							stack: minimizeAll(state.stack).map((m) =>
								m.uid === targetUid
									? { ...preparedConfig, minimized: false }
									: m,
							),
						}));

						return preparedConfig.uid;
					},

					close: (uid) =>
						set((state) => ({
							stack: uid
								? state.stack.filter((m) => m.uid !== uid)
								: state.stack.filter((m) => m.minimized), // Close the visible one
						})),

					closeAll: () => set({ stack: [] }),

					minimize: (uid) =>
						set((state) => ({
							stack: state.stack.map((m) =>
								m.uid === uid ? { ...m, minimized: true } : m,
							),
						})),

					restore: (uid) =>
						set((state) => ({
							stack: minimizeAll(state.stack).map((m) =>
								m.uid === uid ? { ...m, minimized: false } : m,
							),
						})),

					// Get window by uid
					getWindow: (uid) => {
						return get().stack.find((window) => window.uid === uid);
					},

					// Get current/top window
					getCurrentWindow: () => {
						const stack = get().stack;

						return stack.find((m) => !m.minimized);
					},
				};
			},
			{
				name: 'window-store',

				partialize: (state) => ({
					stack: state.stack.map((window) => ({
						uid: window.uid,
						section: window.section,
						dataSource: window.dataSource,
						action: window.action,
						minimized: window.minimized,
						data: window.data,
						props: window.props,
						// Events intentionally omitted — functions are not serializable
					})),
				}),

				// Re-derive complete WindowConfig after rehydration
				onRehydrateStorage: () => (state) => {
					if (!state) {
						return;
					}

					const serializedStack =
						state.stack as unknown as WindowCreateConfig[];

					state.stack = serializedStack
						.map((window) => {
							try {
								return prepareConfigOnCreate(window);
							} catch (error) {
								console.warn(
									`[window-store] Failed to rehydrate window "${window.uid}":`,
									error,
								);
								return null;
							}
						})
						.filter((w): w is WindowConfig => w !== null);
				},
			},
		),
	),
);
