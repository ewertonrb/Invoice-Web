import { ApiError, toApiError } from "@/lib/api/error";
import { shiftListSchema, shiftSchema, shiftInputSchema, type Shift, type ShiftInput } from "./schemas";

async function request(path: string, init?: RequestInit): Promise<unknown> {
  let response: Response;
  try { response = await fetch(`/api/backend${path}`, { ...init, headers: { Accept: "application/json", ...(init?.body ? { "Content-Type": "application/json" } : {}), ...init?.headers } }); }
  catch { throw new ApiError(503, "Could not connect to the server."); }
  if (response.status === 401) { window.location.replace(new URL("/api/auth/clear-session", window.location.origin).href); throw new ApiError(401, "Your session has expired."); }
  if (!response.ok) throw await toApiError(response);
  if (response.status === 204) return undefined;
  return response.json();
}
const base = (companyId: number) => `/companies/${companyId}/shifts`;
export async function getShifts(companyId: number): Promise<Shift[]> { return shiftListSchema.parse(await request(base(companyId))); }
export async function getAvailableShifts(companyId: number): Promise<Shift[]> { return shiftListSchema.parse(await request(`${base(companyId)}/available`)); }
export async function getMyShifts(companyId: number): Promise<Shift[]> { return shiftListSchema.parse(await request(`${base(companyId)}/mine`)); }
export async function createShift(companyId: number, input: ShiftInput): Promise<Shift> { return shiftSchema.parse(await request(base(companyId), { method: "POST", body: JSON.stringify(shiftInputSchema.parse(input)) })); }
export async function acceptShift(companyId: number, id: number): Promise<Shift> { return shiftSchema.parse(await request(`${base(companyId)}/${id}/accept`, { method: "POST" })); }
export async function declineShift(companyId: number, id: number, reason?: string): Promise<Shift> { return shiftSchema.parse(await request(`${base(companyId)}/${id}/decline`, { method: "POST", body: JSON.stringify(reason ? { reason } : {}) })); }
export async function cancelShiftAssignment(companyId: number, shiftId: number, assignmentId: number): Promise<Shift> { return shiftSchema.parse(await request(`${base(companyId)}/${shiftId}/assignments/${assignmentId}/cancel`, { method: "POST" })); }
export async function cancelShift(companyId: number, id: number): Promise<void> { await request(`${base(companyId)}/${id}`, { method: "DELETE" }); }
