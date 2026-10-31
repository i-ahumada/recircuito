"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(pointer: coarse)";

function suscribir(cb: () => void) {
  const mql = window.matchMedia(QUERY);
  mql.addEventListener("change", cb);
  return () => mql.removeEventListener("change", cb);
}

/** true en dispositivos táctiles. En el servidor siempre es false. */
export function useEsTactil(): boolean {
  return useSyncExternalStore(
    suscribir,
    () => window.matchMedia(QUERY).matches,
    () => false,
  );
}
