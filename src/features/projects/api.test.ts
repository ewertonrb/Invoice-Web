import { afterEach, describe, expect, it, vi } from "vitest";
import { createProject, getProject, getProjects, setProjectActive, updateProject } from "./api";

const project = { id: 3, name: "Harbour", companyId: 7, companyName: "Acme", active: true, createdAt: "2026-08-01T10:00:00", updatedAt: "2026-08-02T10:00:00" };

afterEach(() => vi.restoreAllMocks());

function respond(body: unknown, status = 200) {
  vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(status === 204 ? null : JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } }));
}

describe("projects API", () => {
  it("requests a company-context list with activeOnly", async () => {
    respond([project]);
    await expect(getProjects(true)).resolves.toEqual([project]);
    expect(fetch).toHaveBeenCalledWith("/api/backend/projects?activeOnly=true", expect.any(Object));
  });

  it("loads a project detail", async () => {
    respond(project);
    await getProject(3);
    expect(fetch).toHaveBeenCalledWith("/api/backend/projects/3", expect.any(Object));
  });

  it.each([
    ["create", () => createProject({ name: "Harbour" }), "/api/backend/projects", "POST"],
    ["update", () => updateProject(3, { name: "Harbour" }), "/api/backend/projects/3", "PUT"],
  ])("sends the exact name payload for %s", async (_label, action, path, method) => {
    respond(project, method === "POST" ? 201 : 200);
    await action();
    expect(fetch).toHaveBeenCalledWith(path, expect.objectContaining({ method, body: JSON.stringify({ name: "Harbour" }) }));
  });

  it.each([[false, "deactivate"], [true, "reactivate"]] as const)("uses the dedicated status endpoint", async (active, transition) => {
    respond(active ? { ...project, active: true } : null, active ? 200 : 204);
    await setProjectActive(3, active);
    expect(fetch).toHaveBeenCalledWith(`/api/backend/projects/3/${transition}`, expect.objectContaining({ method: "PATCH" }));
  });
});
