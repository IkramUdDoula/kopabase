import { useState, useCallback } from "react";

/**
 * Custom hook for loading state management.
 * @param initial Initial loading state (default: false)
 * @returns [loading, startLoading, stopLoading, setLoading]
 */
export function useLoading(initial: boolean = false) {
  const [loading, setLoading] = useState(initial);
  const startLoading = useCallback(() => setLoading(true), []);
  const stopLoading = useCallback(() => setLoading(false), []);
  return [loading, startLoading, stopLoading, setLoading] as const;
} 