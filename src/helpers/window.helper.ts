export function isLargeScreen(): boolean {
	return window.matchMedia('(min-width: 1024px)').matches;
}
