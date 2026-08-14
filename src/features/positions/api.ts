import { ApiError, toApiError } from "@/lib/api/error";
import { projectListResponseSchema, type Project } from "@/features/projects/schemas";
import { positionListResponseSchema, positionResponseSchema, positionSchema, type Position, type PositionInput } from "./schemas";

async function request(path: string, init?: RequestInit): Promise<unknown> {
  let response: Response;
  try { response = await fetch(`/api/backend${path}`, { ...init, headers: { Accept: "application/json", ...(init?.body ? { "Content-Type": "application/json" } : {}), ...init?.headers } }); }
  catch { throw new ApiError(503, "Could not connect to the server."); }
  if (response.status === 401) { window.location.replace(new URL("/api/auth/clear-session", window.location.origin).href); throw new ApiError(401, "Your session has expired."); }
  if (!response.ok) throw await toApiError(response);
  if (response.status === 204) return undefined;
  return response.json();
}

export async function getPositions(activeOnly: boolean, projectId?: number): Promise<Position[]> {
  const path = projectId ? `/projectpositions/project/${projectId}?activeOnly=${activeOnly}` : `/projectpositions?activeOnly=${activeOnly}`;
  return positionListResponseSchema.parse(await request(path));
}
export async function getPosition(id: number): Promise<Position> { return positionResponseSchema.parse(await request(`/projectpositions/${id}`)); }
export async function getActiveProjects(): Promise<Project[]> { return projectListResponseSchema.parse(await request("/projects?activeOnly=true")); }
export async function createPosition(input: PositionInput): Promise<Position> { return positionResponseSchema.parse(await request("/projectpositions", { method: "POST", body: JSON.stringify(positionSchema.parse(input)) })); }
export async function updatePosition(id: number, input: PositionInput): Promise<Position> { return positionResponseSchema.parse(await request(`/projectpositions/${id}`, { method: "PUT", body: JSON.stringify(positionSchema.parse(input)) })); }
export async function setPositionActive(id: number, active: boolean): Promise<Position | undefined> { const data = await request(`/projectpositions/${id}/${active ? "reactivate" : "deactivate"}`, { method: "PATCH" }); return data ? positionResponseSchema.parse(data) : undefined; }
