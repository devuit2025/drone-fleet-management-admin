import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function getByPath<T = any>(obj: any, path: string | string[], fallback?: T): T | undefined {
    if (!obj || !path) return fallback;
    const parts = Array.isArray(path) ? path : String(path).split('.');
    let cur: any = obj;
    for (const p of parts) {
        if (cur == null) return fallback;
        cur = cur[p];
    }
    return (cur === undefined ? fallback : (cur as T));
}
