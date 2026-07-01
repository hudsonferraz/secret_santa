export function buildRevealPath(revealToken: string) {
  return `/r/${revealToken}`;
}

export function getConfiguredAppOrigin(): string | null {
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (!configuredUrl) {
    return null;
  }

  return configuredUrl.replace(/\/+$/, "");
}

export function buildRevealUrl(revealToken: string, origin: string) {
  return `${origin}${buildRevealPath(revealToken)}`;
}
