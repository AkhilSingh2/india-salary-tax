import type { ReactNode } from "react";

export function Bi({ en, hi }: { en: ReactNode; hi: ReactNode }) {
  return (
    <>
      <span className="i18n" lang="en">{en}</span>
      <span className="i18n" lang="hi">{hi}</span>
    </>
  );
}
