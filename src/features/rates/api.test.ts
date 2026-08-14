import { afterEach, describe, expect, it, vi } from "vitest";
import { createRate, getRate, getRates, setRateActive, updateRate } from "./api";

const rate = { id: 4, projectPositionId: 9, positionName: "Carpenter", projectId: 3, projectName: "Site", companyId: 7, companyName: "Acme", effectiveFrom: "2026-08-01", effectiveTo: null, active: true, items: [], createdAt: "2026-08-01T00:00:00", updatedAt: "2026-08-01T00:00:00" };
const input = { projectPositionId: 9, effectiveFrom: "2026-08-01", effectiveTo: "", items: [{ rateType: "REGULAR" as const, calculationType: "BASE_RATE" as const, value: "42.50", description: "" }] };

afterEach(() => vi.restoreAllMocks());
function respond(body: unknown, status = 200) { vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(status === 204 ? null : JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } })); }

describe("rates API", () => {
  it("uses position-scoped list and id detail routes", async () => {
    respond([rate]); await getRates(9);
    expect(fetch).toHaveBeenCalledWith("/api/backend/project-role-rates/position/9", expect.any(Object));
    vi.restoreAllMocks(); respond(rate); await getRate(4);
    expect(fetch).toHaveBeenCalledWith("/api/backend/project-role-rates/4", expect.any(Object));
  });

  it.each([["create", () => createRate(input), "/api/backend/project-role-rates", "POST"], ["update", () => updateRate(4, input), "/api/backend/project-role-rates/4", "PUT"]] as const)("normalizes optional fields for %s", async (_label, action, path, method) => {
    respond(rate, method === "POST" ? 201 : 200); await action();
    expect(fetch).toHaveBeenCalledWith(path, expect.objectContaining({ method, body: JSON.stringify({ ...input, effectiveTo: null, items: [{ ...input.items[0], description: null }] }) }));
  });

  it.each([[false, "deactivate", 204], [true, "reactivate", 200]] as const)("uses PATCH %s transition", async (active, transition, status) => {
    respond(active ? rate : null, status); await setRateActive(4, active);
    expect(fetch).toHaveBeenCalledWith(`/api/backend/project-role-rates/4/${transition}`, expect.objectContaining({ method: "PATCH" }));
  });
});
