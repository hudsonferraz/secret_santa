import type { Event } from "@/generated/prisma/client";

export type { Event };

export type PersonPublic = {
  id: number;
  name: string;
};

export type PersonSearchResponse = {
  person: PersonPublic | null;
  personMatched?: PersonPublic;
};

export type ApiErrorResponse = {
  error: string;
};

export type ApiResult<T> =
  | { ok: true; data: T; status: number }
  | { ok: false; error: string; status: number };
