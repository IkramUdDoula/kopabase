import { useState, useCallback } from "react";

/**
 * Custom hook for dialog open/close state management.
 * @param initial Initial open state (default: false)
 * @returns [open, openDialog, closeDialog, setOpen]
 */
export function useDialog(initial: boolean = false) {
  const [open, setOpen] = useState(initial);
  const openDialog = useCallback(() => setOpen(true), []);
  const closeDialog = useCallback(() => setOpen(false), []);
  return [open, openDialog, closeDialog, setOpen] as const;
} 