export abstract class BaseService {
	protected getFromStorage<T>(key: string): T[] {
		if (typeof window === "undefined") return [];
		const data = localStorage.getItem(key);
		return data ? JSON.parse(data) : [];
	}

	protected saveToStorage<T>(key: string, data: T[]): void {
		if (typeof window === "undefined") return;
		localStorage.setItem(key, JSON.stringify(data));
	}

	protected generateId(): string {
		return Date.now().toString(36) + Math.random().toString(36).substr(2);
	}

	protected getCurrentTimestamp(): string {
		return new Date().toISOString();
	}
}
