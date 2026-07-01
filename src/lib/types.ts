import type { Event, EventGroup, EventPeople } from "@/generated/prisma/client";

export type { Event, EventGroup, EventPeople };

export type PersonPublic = {
  id: number;
  name: string;
};

export type PersonSearchResponse = {
  person: PersonPublic | null;
  personMatched?: PersonPublic;
};

export type OrganizerProfile = {
  id: number;
  email: string;
  name: string;
};

export type ApiErrorResponse = {
  error: string;
};

export type ApiResult<T> =
  | { ok: true; data: T; status: number }
  | { ok: false; error: string; status: number };
