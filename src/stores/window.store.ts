import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import {
	type DataSourceKey,
	getDataSourceConfig,
} from '@/config/data-source.config';
import ValueError from '@/exceptions/value.error';
import { generateWindowUid } from '@/helpers/window.helper';
import type {
	WindowConfig,
	WindowCreateConfig,
	WindowDefinition,
	WindowEntryType,
} from '@/types/window.type';

type WindowStore = {
	stack: WindowConfig[];
	open: <Entry extends WindowEntryType>(
		config: WindowCreateConfig<Entry>,
		replacedUid?: string,
	) => string; // If argument `replacedUid` is provided and a window exists it will be closed
	close: (uid?: string) => void; // Removes from stack
	closeAll: () => void; // Clear stack
	minimize: (uid: string) => void; // Still in stack, hidden
	focus: (uid: string) => void; // Still in stack, visible again
	getWindow: (uid: string) => WindowConfig | undefined; // Get window by uid
	getCurrentWindow: () => WindowConfig | undefined; // Get top window
};

// Helper to prepare config on create
const prepareConfigOnCreate = <Entry extends WindowEntryType>(
	config: WindowCreateConfig<Entry>,
): WindowConfig => {
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
				reloadEntry: actionConfig.reloadEntry,
				prepareEntry: actionConfig.prepareEntry,
				displayEntryLabel: getDataSourceConfig(
					enrichedConfig.dataSource as DataSourceKey,
					'displayEntryLabel',
				),
			};

			// Return complete WindowConfig
			return {
				...enrichedConfig,
				uid:
					enrichedConfig.uid ??
					generateWindowUid({
						dataSource: enrichedConfig.dataSource,
						action: enrichedConfig.action,
						entriesSelection: actionConfig.entriesSelection,
						entries: enrichedConfig.data?.entries,
					}),
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

				// // Private helper to get focused (top) window
				// const getFocusedWindow = (): WindowConfig | undefined => {
				// 	return get().stack.find((m) => !m.minimized);
				// };

				const minimizeAll = (stack: WindowConfig[]): WindowConfig[] =>
					stack.map((m) =>
						m.minimized ? m : { ...m, minimized: true },
					);

				return {
					stack: [],

					open: (config, replacedUid) => {
						// Close a different window if explicitly requested (e.g. replacing a stale entry)
						if (replacedUid) {
							get().close(replacedUid);
						}

						const preparedConfig = prepareConfigOnCreate(config);
						const alreadyExists = windowExists(preparedConfig.uid);

						set((state) => {
							const minimizedStack = minimizeAll(state.stack);

							if (!alreadyExists) {
								// New window — push to top of stack
								return {
									stack: [...minimizedStack, preparedConfig],
								};
							}

							// Existing window — update in-place and bring to front (un-minimize)
							return {
								stack: minimizedStack.map((w) =>
									w.uid === preparedConfig.uid
										? {
												...preparedConfig,
												minimized: false,
											}
										: w,
								),
							};
						});

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

					focus: (uid) =>
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

				skipHydration: true, // hydration is handled via data-source-registrar.component

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
