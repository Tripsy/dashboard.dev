export function readFromLocalStorage<T>(key: string): T | null {
	try {
		const data = localStorage.getItem(key);

		if (data === null || data === 'undefined') {
			return null;
		}

		return JSON.parse(data) as T;
	} catch {
		return null;
	}
}
