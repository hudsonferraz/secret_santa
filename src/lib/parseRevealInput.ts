const REVEAL_TOKEN_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function parseRevealInput(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) {
    return null;
  }

  const revealPathMatch = trimmed.match(/\/r\/([^/?#\s]+)/i);
  if (revealPathMatch?.[1]) {
    return decodeURIComponent(revealPathMatch[1]);
  }

  if (REVEAL_TOKEN_PATTERN.test(trimmed)) {
    return trimmed;
  }

  return null;
}

export function looksLikeLegacyEventInput(raw: string): boolean {
  const trimmed = raw.trim();
  if (!trimmed) {
    return false;
  }

  if (/^\d+$/.test(trimmed)) {
    return true;
  }

  return /\/event\/(\d+)/.test(trimmed);
}
