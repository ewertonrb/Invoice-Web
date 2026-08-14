import { ApiError, toApiError } from "@/lib/api/error";
import { projectListResponseSchema, projectResponseSchema, projectSchema, type Project, type ProjectInput } from "./schemas";

async function request(path: string, init?: RequestInit): Promise<unknown> {
  let response: Response;
  try {
    response = await fetch(`/api/backend${path}`, {
      ...init,
      headers: { Accept: "application/json", ...(init?.body ? { "Content-Type": "application/json" } : {}), ...init?.headers },
    });
  } catch {
    throw new ApiError(503, "Could not connect to the server.");
  }
  if (response.status === 401) {
    window.location.replace(new URL("/api/auth/clear-session", window.location.origin).href);
    throw new ApiError(401, "Your session has expired.");
  }
  if (!response.ok) throw await toApiError(response);
  if (response.status === 204) return undefined;
  return response.json();
}

export async function getProjects(activeOnly: boolean): Promise<Project[]> {
  return projectListResponseSchema.parse(await request(`/projects?activeOnly=${activeOnly}`));
}

export async function getProject(projectId: number): Promise<Project> {
  return projectResponseSchema.parse(await request(`/projects/${projectId}`));
}

export async function createProject(input: ProjectInput): Promise<Project> {
  return projectResponseSchema.parse(await request("/projects", { method: "POST", body: JSON.stringify(projectSchema.parse(input)) }));
}

export async function updateProject(projectId: number, input: ProjectInput): Promise<Project> {
  return projectResponseSchema.parse(await request(`/projects/${projectId}`, { method: "PUT", body: JSON.stringify(projectSchema.parse(input)) }));
}

export async function setProjectActive(projectId: number, active: boolean): Promise<Project | undefined> {
  const result = await request(`/projects/${projectId}/${active ? "reactivate" : "deactivate"}`, { method: "PATCH" });
  return result ? projectResponseSchema.parse(result) : undefined;
}
