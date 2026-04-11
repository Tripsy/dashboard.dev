const DATA_TABLE_ACTION_EVENT = 'useDataTableAction' as const;

type DataTableActionDetail<Entry> = {
	source: string;
	actionName: string;
	entry: Entry;
};

export function dispatchDataTableAction<Entry>(
	detail: DataTableActionDetail<Entry>,
): void {
	window.dispatchEvent(new CustomEvent(DATA_TABLE_ACTION_EVENT, { detail }));
}

export function addDataTableActionListener<Entry>(
	handler: (detail: DataTableActionDetail<Entry>) => void,
): () => void {
	const listener = (event: Event) => {
		const { detail } = event as CustomEvent<DataTableActionDetail<Entry>>;

		handler(detail);
	};

	window.addEventListener(DATA_TABLE_ACTION_EVENT, listener);

	return () => window.removeEventListener(DATA_TABLE_ACTION_EVENT, listener);
}
