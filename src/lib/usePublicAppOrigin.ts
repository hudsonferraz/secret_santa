"use client";

import { useSyncExternalStore } from "react";
import { getConfiguredAppOrigin } from "@/lib/revealUrl";

const emptySubscribe = () => () => {};

function getClientOriginSnapshot() {
  return window.location.origin;
}

function getServerOriginSnapshot() {
  return "";
}

export function usePublicAppOrigin(): string {
  const configuredOrigin = getConfiguredAppOrigin();
  const clientOrigin = useSyncExternalStore(
    emptySubscribe,
    getClientOriginSnapshot,
    getServerOriginSnapshot,
  );

  return configuredOrigin ?? clientOrigin;
}
