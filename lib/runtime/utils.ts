export interface Map<T> {
	[ key: string ]: T;
}

export function toArray<T>(value: T | T[]): T[] {
	if (value instanceof Array) return value;
	return [<T> value];
}