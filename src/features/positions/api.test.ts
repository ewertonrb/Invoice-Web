import { afterEach, describe, expect, it, vi } from "vitest";
import { createPosition, getActiveProjects, getPosition, getPositions, setPositionActive, updatePosition } from "./api";

const position = { id: 9, positionName: "Installer", projectId: 5, projectName: "Harbour", companyId: 7, companyName: "Acme", active: true, createdAt: "2026-08-01T10:00:00", updatedAt: "2026-08-02T10:00:00" };
const project = { id: 5, name: "Harbour", companyId: 7, companyName: "Acme", active: true, createdAt: "2026-08-01T10:00:00", updatedAt: "2026-08-02T10:00:00" };

afterEach(() => vi.restoreAllMocks());
function respond(body: unknown, status = 200) { vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(status === 204 ? null : JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } })); }

describe("positions API", () => {
  it.each([
    [undefined, "/api/backend/projectpositions?activeOnly=true"],
    [5, "/api/backend/projectpositions/project/5?activeOnly=true"],
  ])("loads a scoped list for project %s", async (projectId, path) => {
    respond([position]);
    await getPositions(true, projectId);
    expect(fetch).toHaveBeenCalledWith(path, expect.any(Object));
  });

  it("loads detail and active projects", async () => {
    respond(position); await getPosition(9);
    expect(fetch).toHaveBeenLastCalledWith("/api/backend/projectpositions/9", expect.any(Object));
    vi.restoreAllMocks(); respond([project]); await getActiveProjects();
    expect(fetch).toHaveBeenLastCalledWith("/api/backend/projects?activeOnly=true", expect.any(Object));
  });

  it.each([
    [() => createPosition({ projectId: 5, positionName: "Installer" }), "/api/backend/projectpositions", "POST"],
    [() => updatePosition(9, { projectId: 5, positionName: "Installer" }), "/api/backend/projectpositions/9", "PUT"],
  ])("sends the exact position payload", async (action, path, method) => {
    respond(position, method === "POST" ? 201 : 200); await action();
    expect(fetch).toHaveBeenCalledWith(path, expect.objectContaining({ method, body: JSON.stringify({ projectId: 5, positionName: "Installer" }) }));
  });

  it.each([[false, "deactivate"], [true, "reactivate"]] as const)("uses dedicated status transition", async (active, transition) => {
    respond(active ? position : null, active ? 200 : 204); await setPositionActive(9, active);
    expect(fetch).toHaveBeenCalledWith(`/api/backend/projectpositions/9/${transition}`, expect.objectContaining({ method: "PATCH" }));
  });
});
