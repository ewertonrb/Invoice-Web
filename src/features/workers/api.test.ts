import { afterEach, describe, expect, it, vi } from "vitest";
import { getWorker, getWorkers, promoteWorker, setWorkerSuspended, updateMyProfile } from "./api";

const worker = { id: 1, appUserId: 2, fullName: "Alex Worker", email: "alex@example.com", abn: null, gstRegistered: false, phone: null, status: "INCOMPLETE", membershipId: 12, membershipRole: "WORKER", membershipStatus: "ACTIVE", completedAt: null, bankDetails: null, superDetails: null, notes: null, createdAt: "2026-01-01T00:00:00", updatedAt: "2026-01-01T00:00:00" };
afterEach(() => vi.restoreAllMocks());
const respond = (body: unknown) => vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify(body), { status: 200, headers: { "Content-Type": "application/json" } }));

describe("workers API", () => {
  it("uses company-scoped list and detail paths", async () => { respond([]); await getWorkers(7); expect(fetch).toHaveBeenCalledWith("/api/backend/companies/7/workers?activeOnly=true", expect.any(Object)); vi.restoreAllMocks(); respond(worker); await getWorker(7, 1); expect(fetch).toHaveBeenCalledWith("/api/backend/companies/7/workers/1", expect.any(Object)); });
  it("forwards activeOnly and membership status filters", async () => { respond([]); await getWorkers(7, false, "SUSPENDED"); expect(fetch).toHaveBeenCalledWith("/api/backend/companies/7/workers?activeOnly=false&status=SUSPENDED", expect.any(Object)); });
  it.each([[true, "suspend"], [false, "reactivate"]] as const)("uses PATCH for worker membership status", async (suspended, action) => { respond(worker); await setWorkerSuspended(7, 1, suspended); expect(fetch).toHaveBeenCalledWith(`/api/backend/companies/7/workers/1/${action}`, expect.objectContaining({ method: "PATCH" })); });
  it.each(["MANAGER", "FINANCE"] as const)("promotes through company-scoped membership endpoint to %s", async (role) => { respond({}); await promoteWorker(7, 12, role); expect(fetch).toHaveBeenCalledWith("/api/backend/companies/7/memberships/12/role", expect.objectContaining({ method: "PATCH", body: JSON.stringify({ role }) })); });
  it("normalizes empty optional profile fields to null", async () => { respond(worker); await updateMyProfile({ abn: "", gstRegistered: false, phone: "", bankDetails: { bankName: "", accountName: "", bsb: "", accountNumber: "" }, superDetails: { fundName: "", usi: "", memberNumber: "" }, notes: "" }); const call = vi.mocked(fetch).mock.calls[0][1]; expect(JSON.parse(String(call?.body))).toEqual({ abn: null, gstRegistered: false, phone: null, bankDetails: { bankName: null, accountName: null, bsb: null, accountNumber: null }, superDetails: { fundName: null, usi: null, memberNumber: null }, notes: null }); });
});
