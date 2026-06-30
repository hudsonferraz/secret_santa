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
