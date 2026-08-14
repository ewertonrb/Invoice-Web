import { ApiError, toApiError } from "@/lib/api/error";
import { notificationListSchema, type Notification } from "./schemas";

async function request(path: string, init?: RequestInit): Promise<unknown> {
  let response: Response;
  try { response = await fetch(`/api/backend${path}`, { ...init, headers: { Accept: "application/json", ...(init?.body ? { "Content-Type": "application/json" } : {}), ...init?.headers } }); }
  catch { throw new ApiError(503, "Could not connect to the server."); }
  if (response.status === 401) { window.location.replace(new URL("/api/auth/clear-session", window.location.origin).href); throw new ApiError(401, "Your session has expired."); }
  if (!response.ok) throw await toApiError(response);
  if (response.status === 204) return undefined;
  return response.json();
}
const base = (companyId: number) => `/companies/${companyId}/notifications`;
export async function getNotifications(companyId: number): Promise<Notification[]> { return notificationListSchema.parse(await request(base(companyId))); }
export async function getUnreadCount(companyId: number): Promise<number> { const value = await request(`${base(companyId)}/unread-count`); return typeof value === "number" ? value : Number(value); }
export async function markNotificationRead(companyId: number, id: number): Promise<void> { await request(`${base(companyId)}/${id}/read`, { method: "PATCH" }); }
export async function markAllNotificationsRead(companyId: number): Promise<void> { await request(`${base(companyId)}/read-all`, { method: "PATCH" }); }
