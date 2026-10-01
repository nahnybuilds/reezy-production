"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/** Masthead date in the reader's own time zone, e.g. "Thu 11 Sep" (Figma A7/B1). */
export function TodayDate() {
  const label = useSyncExternalStore(
    subscribe,
    () => new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short" }).format(new Date()).replace(",", ""),
    () => "",
  );
  return <span className="text-label text-ink-muted" suppressHydrationWarning>{label}</span>;
}
