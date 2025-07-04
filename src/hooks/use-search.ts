import { useState, useCallback } from "react";

/**
 * Custom hook for search term state management.
 * @param initial Initial search term (default: empty string)
 * @returns [searchTerm, setSearchTerm, resetSearch]
 */
export function useSearch(initial: string = "") {
  const [searchTerm, setSearchTerm] = useState(initial);
  const resetSearch = useCallback(() => setSearchTerm(initial), [initial]);
  return [searchTerm, setSearchTerm, resetSearch] as const;
} 