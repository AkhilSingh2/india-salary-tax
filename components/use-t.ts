"use client";

import { useSutra } from "@sutra-ui/react";
import { useCallback } from "react";

export function useT() {
  const { locale } = useSutra();
  return useCallback((en: string, hi: string) => (locale === "hi" ? hi : en), [locale]);
}
