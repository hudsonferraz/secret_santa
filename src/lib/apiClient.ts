import type { ApiErrorResponse, ApiResult, PersonSearchResponse } from "@/lib/types";

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  token?: string;
  signal?: AbortSignal;
};

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<ApiResult<T>> {
  const { method = "GET", body, token, signal } = options;

  const headers: HeadersInit = {
    Accept: "application/json",
  };

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response: Response;

  try {
    response = await fetch(path, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
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

export async function searchPersonByPhone(
  eventId: number,
  phoneNumber: string,
) {
  const query = new URLSearchParams({ phone_number: phoneNumber });
  return apiRequest<PersonSearchResponse>(
    `/api/people/${eventId}/search?${query.toString()}`,
  );
}

export async function adminLogin(password: string) {
  return apiRequest<{ token: string }>("/api/admin/login", {
    method: "POST",
    body: { password },
  });
}

export async function adminPing(token: string) {
  return apiRequest<{ pong: boolean; admin: boolean }>("/api/admin/ping", {
    token,
  });
}

export async function adminGetEvents(token: string) {
  return apiRequest<{ events: import("@/lib/types").Event[] }>(
    "/api/admin/events",
    { token },
  );
}

export async function adminCreateEvent(
  token: string,
  data: { title: string; description: string; grouped: boolean },
) {
  return apiRequest<{ event: import("@/lib/types").Event }>(
    "/api/admin/events",
    { method: "POST", body: data, token },
  );
}

export async function adminGetEvent(token: string, eventId: number) {
  return apiRequest<{ event: import("@/lib/types").Event }>(
    `/api/admin/events/${eventId}`,
    { token },
  );
}

export async function adminUpdateEvent(
  token: string,
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
    { method: "PUT", body: data, token },
  );
}

export async function adminDeleteEvent(token: string, eventId: number) {
  return apiRequest<{ event: import("@/lib/types").Event }>(
    `/api/admin/events/${eventId}`,
    { method: "DELETE", token },
  );
}

export async function adminGetGroups(token: string, eventId: number) {
  return apiRequest<{ groups: import("@/lib/types").EventGroup[] }>(
    `/api/admin/groups/${eventId}`,
    { token },
  );
}

export async function adminCreateGroup(
  token: string,
  eventId: number,
  name: string,
) {
  return apiRequest<{ group: import("@/lib/types").EventGroup }>(
    `/api/admin/groups/${eventId}`,
    { method: "POST", body: { name }, token },
  );
}

export async function adminDeleteGroup(
  token: string,
  eventId: number,
  groupId: number,
) {
  return apiRequest<{ group: import("@/lib/types").EventGroup }>(
    `/api/admin/groups/${eventId}/${groupId}`,
    { method: "DELETE", token },
  );
}

export async function adminGetPeople(
  token: string,
  eventId: number,
  groupId: number,
) {
  return apiRequest<{ people: import("@/lib/types").EventPeople[] }>(
    `/api/admin/people/${eventId}/${groupId}`,
    { token },
  );
}

export async function adminCreatePerson(
  token: string,
  eventId: number,
  groupId: number,
  data: { name: string; phone_number: string },
) {
  return apiRequest<{ person: import("@/lib/types").EventPeople }>(
    `/api/admin/people/${eventId}/${groupId}`,
    { method: "POST", body: data, token },
  );
}

export async function adminDeletePerson(
  token: string,
  eventId: number,
  groupId: number,
  personId: number,
) {
  return apiRequest<{ person: import("@/lib/types").EventPeople }>(
    `/api/admin/people/${eventId}/${groupId}/${personId}`,
    { method: "DELETE", token },
  );
}
