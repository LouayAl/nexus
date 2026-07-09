// src/hooks/useDraftState.ts
"use client";

import { useState } from "react";

/**
 * Drop-in replacement for useState that persists to sessionStorage.
 * Survives accidental modal closes / tab navigation, cleared only when clearDraft() is called
 * (call it in onSuccess, right before onClose()).
 */
export function useDraftState<T>(storageKey: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === "undefined") return initialValue;
    try {
      const saved = sessionStorage.getItem(storageKey);
      return saved !== null ? JSON.parse(saved) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setAndPersist: typeof setValue = (update) => {
    setValue((prev) => {
      const next = typeof update === "function" ? (update as (p: T) => T)(prev) : update;
      try {
        sessionStorage.setItem(storageKey, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const clearDraft = () => {
    try {
      sessionStorage.removeItem(storageKey);
    } catch {}
    setValue(initialValue);
  };

  return [value, setAndPersist, clearDraft] as const;
}