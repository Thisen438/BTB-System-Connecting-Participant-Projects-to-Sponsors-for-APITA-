"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

// A moment shown in the viewer's own time zone. The server does not know that zone,
// so the text is filled in by the browser (empty in the first HTML).
export function LocalTime({ iso }: { iso: string }) {
  const text = useSyncExternalStore(
    subscribe,
    () =>
      new Date(iso).toLocaleString(undefined, {
        weekday: "short",
        day: "numeric",
        month: "short",
        hour: "numeric",
        minute: "2-digit",
      }),
    () => "",
  );
  return <time dateTime={iso}>{text}</time>;
}
