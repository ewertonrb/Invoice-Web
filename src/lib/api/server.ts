import { ApiError, toApiError } from "@/lib/api/error";

const DEFAULT_API_URL = "http://localhost:8080";

function apiUrl(path: string): URL {
  const base = process.env.API_BASE_URL || DEFAULT_API_URL;
  return new URL(path.startsWith("/") ? path : `/${path}`, base);
}

export async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
  token?: string,
): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  let response: Response;
  try {
    response = await fetch(apiUrl(path), { ...init, headers, cache: "no-store" });
  } catch {
    throw new ApiError(503, "Could not connect to the server.");
  }

  if (!response.ok) throw await toApiError(response);
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export function getApiUrl(path: string): URL {
  return apiUrl(path);
}
