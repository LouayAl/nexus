"use client";

import { useEffect, useState } from "react";

export type AppLanguage = "fr" | "en";

const STORAGE_KEY = "nexus-language";

export function useAppLanguage(defaultLanguage: AppLanguage = "fr") {
  const [language, setLanguage] = useState<AppLanguage>(defaultLanguage);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "fr" || stored === "en") {
      setLanguage(stored);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, language);
    document.documentElement.lang = language;
  }, [language]);

  return {
    language,
    setLanguage,
  };
}
