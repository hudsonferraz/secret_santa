export function buildRevealPath(revealToken: string) {
  return `/r/${revealToken}`;
}

export function buildRevealUrl(revealToken: string, origin: string) {
  return `${origin}${buildRevealPath(revealToken)}`;
}
