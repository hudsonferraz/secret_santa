export type EventInputTarget =
  | { type: "event"; eventId: number }
  | { type: "reveal"; token: string };

const REVEAL_TOKEN_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function parseEventInput(raw: string): EventInputTarget | null {
  const trimmed = raw.trim();
  if (!trimmed) {
    return null;
  }

  const revealPathMatch = trimmed.match(/\/r\/([^/?#\s]+)/i);
  if (revealPathMatch?.[1]) {
    return { type: "reveal", token: decodeURIComponent(revealPathMatch[1]) };
  }

  const eventPathMatch = trimmed.match(/\/event\/(\d+)/);
  if (eventPathMatch?.[1]) {
    const eventId = Number(eventPathMatch[1]);
    if (!Number.isNaN(eventId)) {
      return { type: "event", eventId };
    }
  }

  if (/^\d+$/.test(trimmed)) {
    return { type: "event", eventId: Number(trimmed) };
  }

  if (REVEAL_TOKEN_PATTERN.test(trimmed)) {
    return { type: "reveal", token: trimmed };
  }

  return null;
}
