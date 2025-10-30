import { useRef } from "react";

export function useDebounce<T>(callback: (...args: T[]) => void, delay: number) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  return (...args: T[]) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  };
}
