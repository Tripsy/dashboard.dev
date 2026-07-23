import type { PrimeReactPTOptions } from 'primereact/api';
import type { ColumnPassThroughMethodOptions } from 'primereact/column';

/**
 * PrimeReact "unstyled" pass-through (PT) preset, styled with HeroUI v3 tokens.
 *
 * We run PrimeReact in `unstyled` mode (see prime.provider.tsx) so it emits NO CSS of
 * its own — every visible style comes from the Tailwind classes below. Stateful styling
 * relies on the `data-p-*` attributes PrimeReact adds in unstyled mode (e.g.
 * `data-p-highlight`, `data-p-disabled`) plus CSS variants (`even:`, `hover:`), because
 * the PT `context` object is minimal in this version. Column state (sorted/sortable) is
 * read from the typed PT method options.
 *
 * PT values use the `{ className }` object form (the type-safe shape accepted by
 * PrimeReact's PassThroughType); dynamic entries are functions returning the same.
 *
 * NOTE: fine spacing/border/selected-state details are best confirmed against the live
 * (auth-gated) table and tuned from there.
 */

const cx = (...c: Array<string | false | undefined>): string =>
	c.filter(Boolean).join(' ');

const pageButton = {
	className: cx(
		'inline-flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-sm font-medium transition-colors',
		'hover:bg-surface-secondary disabled:opacity-40 disabled:pointer-events-none',
		'aria-[current=true]:bg-accent aria-[current=true]:text-accent-foreground',
	),
};

export const primePtPreset: PrimeReactPTOptions = {
	datatable: {
		root: { className: 'w-full text-sm text-foreground' },
		table: { className: 'w-full border-collapse' },
		thead: { className: 'bg-surface-secondary/70 text-foreground' },
		wrapper: { className: 'overflow-auto rounded-lg' },
		bodyRow: {
			className: cx(
				'border-b border-border transition-colors even:bg-surface-secondary/25',
				'hover:bg-surface-secondary/60 data-[p-highlight=true]:bg-accent-soft data-[p-highlight=true]:text-accent-soft-foreground',
			),
		},
		loadingOverlay: {
			className:
				'absolute inset-0 z-20 flex items-center justify-center bg-surface/60 backdrop-blur-[1px]',
		},
		emptyMessage: { className: 'text-center text-muted py-6' },
		// Vertical guideline shown while dragging a column resize.
		resizeHelper: { className: 'absolute z-30 w-px bg-accent' },
	},
	column: {
		headerCell: (o: ColumnPassThroughMethodOptions) => ({
			className: cx(
				'relative px-3 py-3 text-left text-md border-b border-r border-border last:border-r-0 whitespace-nowrap',
				o.props?.sortable &&
					'cursor-pointer select-none hover:bg-surface-secondary/60',
			),
		}),
		headerContent: { className: 'flex items-center gap-2' },
		bodyCell: { className: 'px-3 py-2 align-middle' },
		sortIcon: (o: ColumnPassThroughMethodOptions) => ({
			className: cx(
				'text-xs',
				o.context?.sorted ? 'text-accent' : 'text-muted',
			),
		}),
		// Drag handle for `resizableColumns`; unstyled mode renders it with no size/cursor.
		columnResizer: {
			className:
				'absolute top-0 right-0 h-full w-1.5 cursor-col-resize touch-none select-none',
		},
		// Selection checkboxes are styled by the top-level `checkbox` PT below.
	},
	checkbox: {
		root: { className: 'relative inline-flex h-5 w-5 align-middle' },
		// Unstyled mode stops hiding PrimeReact's native <input>; overlay it transparently
		// over the styled box so only the box shows (and the input stays clickable).
		input: {
			className:
				'absolute inset-0 h-full w-full cursor-pointer opacity-0',
		},
		box: {
			className: cx(
				'flex h-5 w-5 items-center justify-center rounded-sm border border-accent bg-field text-accent-foreground',
				'transition-colors data-[p-highlight=true]:bg-accent data-[p-highlight=true]:border-accent',
			),
		},
		icon: { className: 'h-3.5 w-3.5' },
	},
	paginator: {
		root: {
			className:
				'relative flex items-center justify-center gap-1.5 pt-4 text-sm',
		},
		firstPageButton: pageButton,
		prevPageButton: pageButton,
		nextPageButton: pageButton,
		lastPageButton: pageButton,
		pageButton,
	},
	dropdown: {
		root: {
			className:
				'inline-flex items-center gap-2 rounded-md border border-border bg-field px-2 py-1 text-sm',
		},
		input: { className: 'text-field-foreground' },
		trigger: { className: 'text-muted' },
		panel: {
			className:
				'z-50 overflow-hidden rounded-md border border-border bg-overlay text-overlay-foreground shadow-md',
		},
		list: { className: 'p-1' },
		item: {
			className: cx(
				'px-3 py-1.5 text-sm rounded-sm cursor-pointer hover:bg-surface-secondary',
				'data-[p-highlight=true]:bg-accent-soft data-[p-highlight=true]:text-accent-soft-foreground',
			),
		},
	},
};
