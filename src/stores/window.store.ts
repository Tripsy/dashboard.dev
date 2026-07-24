import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { getDataSourceConfig } from '@/config/data-source.config';
import ValueError from '@/exceptions/value.error';
import { generateWindowUid } from '@/helpers/window.helper';
import type { DataSourceKey } from '@/types/data-source.key';
import { DataSourceSectionEnum } from '@/types/data-source.type';
import type {
	WindowConfig,
	WindowCreateConfig,
	WindowDefinition,
} from '@/types/window.type';

type WindowStore = {
	stack: WindowConfig[];
	open: (
		config: WindowCreateConfig,
		replacedUid?: string, // If argument `replacedUid` is provided and a window exists it will be closed
	) => void;
	close: (uid?: string) => void; // Removes from stack
	closeAll: () => void; // Clear stack
	minimize: (uid: string) => void; // Still in stack, hidden
	focus: (uid: string) => void; // Still in stack, visible again
	getWindow: (uid: string) => WindowConfig | undefined; // Get window by uid
	getCurrentWindow: () => WindowConfig | undefined; // Get top window
};

// Helper to prepare config on create
const prepareConfigOnCreate = async (
	config: WindowCreateConfig,
): Promise<WindowConfig> => {
	const enrichedConfig = { ...config };

	switch (enrichedConfig.section) {
		case DataSourceSectionEnum.DASHBOARD:
		case DataSourceSectionEnum.PUBLIC: {
			const actions = await getDataSourceConfig(
				enrichedConfig.section,
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

			const displayEntryLabel = await getDataSourceConfig(
				enrichedConfig.section,
				enrichedConfig.dataSource as DataSourceKey,
				'displayEntryLabel',
			);

			const definition: WindowDefinition = {
				windowType: actionConfig.windowType,
				windowTitle: actionConfig.windowTitle,
				windowComponent: actionConfig.windowComponent,
				entriesSelection: actionConfig.entriesSelection,
				operationFunction:
					actionConfig.operationFunction as WindowDefinition['operationFunction'],
				button: actionConfig.button,
				validateForm: actionConfig.validateForm,
				getFormValues: actionConfig.getFormValues,
				getFormState: actionConfig.getFormState,
				reloadEntry: actionConfig.reloadEntry,
				prepareEntry: actionConfig.prepareEntry,
				displayEntryLabel,
			} as WindowDefinition;

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
				definition: {
					...definition,
					...enrichedConfig.definition,
				},
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

				const canMinimize = (window: WindowConfig): boolean =>
					window.props?.allowMinimize ?? true;

				// Makes room for the window identified by `activeUid`: every other
				// window is minimized, except the ones flagged `allowMinimize: false`
				// which are dropped from the stack — they have no dock representation
				// to return from, so parking them would strand them.
				const stackBehind = (
					stack: WindowConfig[],
					activeUid: string,
				): WindowConfig[] =>
					stack
						.filter((m) => m.uid === activeUid || canMinimize(m))
						.map((m) =>
							m.minimized || m.uid === activeUid
								? m
								: { ...m, minimized: true },
						);

				return {
					stack: [],

					open: (config, replacedUid) => {
						if (replacedUid) {
							get().close(replacedUid);
						}

						prepareConfigOnCreate(config).then((preparedConfig) => {
							const alreadyExists = windowExists(
								preparedConfig.uid,
							);

							set((state) => {
								const minimizedStack = stackBehind(
									state.stack,
									preparedConfig.uid,
								);

								if (!alreadyExists) {
									return {
										stack: [
											...minimizedStack,
											preparedConfig,
										],
									};
								}

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
						});
					},

					close: (uid) =>
						set((state) => ({
							stack: uid
								? state.stack.filter((m) => m.uid !== uid)
								: state.stack.filter((m) => m.minimized), // Close the visible one
						})),

					closeAll: () => set({ stack: [] }),

					// A window flagged `allowMinimize: false` can only be submitted
					// or closed — never parked in the dock.
					minimize: (uid) =>
						set((state) => ({
							stack: state.stack.map((m) =>
								m.uid === uid && canMinimize(m)
									? { ...m, minimized: true }
									: m,
							),
						})),

					focus: (uid) =>
						set((state) => ({
							stack: stackBehind(state.stack, uid).map((m) =>
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
				onRehydrateStorage: () => async (state) => {
					if (!state) {
						return;
					}

					const serializedStack = state.stack;

					const results = await Promise.allSettled(
						serializedStack.map((window) =>
							prepareConfigOnCreate(window),
						),
					);

					state.stack = results
						.map((result, i) => {
							if (result.status === 'fulfilled')
								return result.value;
							console.warn(
								`[window-store] Failed to rehydrate window "${serializedStack[i].uid}":`,
								result.reason,
							);
							return null;
						})
						.filter((w): w is WindowConfig => w !== null);
				},
			},
		),
	),
);
