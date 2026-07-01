const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILED_ATTEMPTS = 5;

type RateLimitEntry = {
  failedAttempts: number;
  windowStart: number;
};

const failedAttemptsByKey = new Map<string, RateLimitEntry>();

function getOrCreateEntry(key: string, now: number): RateLimitEntry {
  const existingEntry = failedAttemptsByKey.get(key);

  if (!existingEntry || now - existingEntry.windowStart > RATE_LIMIT_WINDOW_MS) {
    const freshEntry = { failedAttempts: 0, windowStart: now };
    failedAttemptsByKey.set(key, freshEntry);
    return freshEntry;
  }

  return existingEntry;
}

export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() ?? "unknown";
  }

  return request.headers.get("x-real-ip") ?? "unknown";
}

export function isAuthRateLimited(
  action: "login" | "register",
  ip: string,
): {
  limited: boolean;
  retryAfterSeconds?: number;
} {
  const key = `${action}:${ip}`;
  const now = Date.now();
  const entry = failedAttemptsByKey.get(key);

  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    return { limited: false };
  }

  if (entry.failedAttempts < MAX_FAILED_ATTEMPTS) {
    return { limited: false };
  }

  const retryAfterSeconds = Math.ceil(
    (RATE_LIMIT_WINDOW_MS - (now - entry.windowStart)) / 1000,
  );

  return { limited: true, retryAfterSeconds };
}

export function recordFailedAuthAttempt(
  action: "login" | "register",
  ip: string,
): void {
  const key = `${action}:${ip}`;
  const now = Date.now();
  const entry = getOrCreateEntry(key, now);
  entry.failedAttempts += 1;
}

export function clearAuthAttempts(action: "login" | "register", ip: string): void {
  failedAttemptsByKey.delete(`${action}:${ip}`);
}
