"use client";

import { SutraProvider, ToastProvider, useSutra } from "@sutra-ui/react";
import { useEffect, useRef, type ReactNode } from "react";

function syncThemeColor() {
  const canvas = getComputedStyle(document.documentElement).getPropertyValue("--sutra-color-bg-canvas").trim();
  if (!canvas) return;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", canvas);
}

function ThemeBridge() {
  const { theme, locale } = useSutra();
  const skipLang = useRef(true);

  useEffect(() => {
    if (skipLang.current) {
      skipLang.current = false;
      return;
    }
    document.documentElement.setAttribute("data-lang", locale === "hi" ? "hi" : "en");
  }, [locale]);

  useEffect(() => {
    syncThemeColor();
    if (theme !== "system") return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    media.addEventListener("change", syncThemeColor);
    return () => media.removeEventListener("change", syncThemeColor);
  }, [theme]);

  return null;
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SutraProvider>
      <ThemeBridge />
      <ToastProvider>{children}</ToastProvider>
    </SutraProvider>
  );
}
