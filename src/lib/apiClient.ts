import type { ApiErrorResponse, ApiResult } from "@/lib/types";

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  signal?: AbortSignal;
};

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<ApiResult<T>> {
  const { method = "GET", body, signal } = options;

  const headers: HeadersInit = {
    Accept: "application/json",
  };

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  let response: Response;

  try {
    response = await fetch(path, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
      credentials: "include",
    });
  } catch {
    return {
      ok: false,
      error: "Não foi possível conectar ao servidor.",
      status: 0,
    };
  }

  let payload: unknown = null;

  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const errorPayload = payload as ApiErrorResponse | null;
    return {
      ok: false,
      error: errorPayload?.error ?? "Ocorreu um erro inesperado.",
      status: response.status,
    };
  }

  return {
    ok: true,
    data: payload as T,
    status: response.status,
  };
}

export async function adminLogin(email: string, password: string) {
  return apiRequest<{ ok: true }>("/api/admin/login", {
    method: "POST",
    body: { email, password },
  });
}

export async function adminRegister(data: {
  name: string;
  email: string;
  password: string;
}) {
  return apiRequest<{ ok: true }>("/api/admin/register", {
    method: "POST",
    body: data,
  });
}

export async function adminLogout() {
  return apiRequest<{ ok: true }>("/api/admin/logout", {
    method: "POST",
  });
}

export async function adminPing() {
  return apiRequest<{
    pong: boolean;
    organizer: import("@/lib/types").OrganizerProfile;
  }>("/api/admin/ping");
}

export async function adminGetEvents() {
  return apiRequest<{ events: import("@/lib/types").Event[] }>(
    "/api/admin/events",
  );
}

export async function adminCreateEvent(data: {
  title: string;
  description: string;
  grouped: boolean;
}) {
  return apiRequest<{ event: import("@/lib/types").Event }>(
    "/api/admin/events",
    { method: "POST", body: data },
  );
}

export async function adminGetEvent(eventId: number) {
  return apiRequest<{ event: import("@/lib/types").Event }>(
    `/api/admin/events/${eventId}`,
  );
}

export async function adminGetDrawPreview(eventId: number) {
  return apiRequest<{ preview: import("@/lib/types").DrawPreview }>(
    `/api/admin/events/${eventId}/draw-preview`,
  );
}

export async function adminUpdateEvent(
  eventId: number,
  data: {
    status?: boolean;
    title?: string;
    description?: string;
    grouped?: boolean;
  },
) {
  return apiRequest<{ event: import("@/lib/types").Event }>(
    `/api/admin/events/${eventId}`,
    { method: "PUT", body: data },
  );
}

export async function adminDeleteEvent(eventId: number) {
  return apiRequest<{ event: import("@/lib/types").Event }>(
    `/api/admin/events/${eventId}`,
    { method: "DELETE" },
  );
}

export async function adminGetGroups(eventId: number) {
  return apiRequest<{ groups: import("@/lib/types").EventGroup[] }>(
    `/api/admin/groups/${eventId}`,
  );
}

export async function adminCreateGroup(eventId: number, name: string) {
  return apiRequest<{ group: import("@/lib/types").EventGroup }>(
    `/api/admin/groups/${eventId}`,
    { method: "POST", body: { name } },
  );
}

export async function adminDeleteGroup(eventId: number, groupId: number) {
  return apiRequest<{ group: import("@/lib/types").EventGroup }>(
    `/api/admin/groups/${eventId}/${groupId}`,
    { method: "DELETE" },
  );
}

export async function adminGetPeople(eventId: number, groupId: number) {
  return apiRequest<{ people: import("@/lib/types").EventPeople[] }>(
    `/api/admin/people/${eventId}/${groupId}`,
  );
}

export async function adminCreatePerson(
  eventId: number,
  groupId: number,
  data: { name: string },
) {
  return apiRequest<{ person: import("@/lib/types").EventPeople }>(
    `/api/admin/people/${eventId}/${groupId}`,
    { method: "POST", body: data },
  );
}

export async function adminUpdatePerson(
  eventId: number,
  groupId: number,
  personId: number,
  data: { name?: string; link_sent?: boolean },
) {
  return apiRequest<{ person: import("@/lib/types").EventPeople }>(
    `/api/admin/people/${eventId}/${groupId}/${personId}`,
    { method: "PUT", body: data },
  );
}

export async function adminDeletePerson(
  eventId: number,
  groupId: number,
  personId: number,
) {
  return apiRequest<{ person: import("@/lib/types").EventPeople }>(
    `/api/admin/people/${eventId}/${groupId}/${personId}`,
    { method: "DELETE" },
  );
}
