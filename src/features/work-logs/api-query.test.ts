import { afterEach, describe, expect, it, vi } from "vitest";
import { getWorkLog, getWorkLogs, rejectWorkLog } from "./api";
import { queryKeys } from "@/lib/api/query-keys";
import { workLogInputSchema } from "./schemas";

const log = { id: 1, workerProfileId: 2, appUserId: 3, workerName: "Alex", workerEmail: "a@example.com", projectPositionId: 4, positionName: "Carpenter", projectId: 5, projectName: "Site", companyId: 7, companyName: "Acme", workDate: "2026-08-01", workTime: null, regularHours: "8", overtime15Hours: "0", overtime20Hours: "0", saturdayHours: "0", sundayHours: "0", publicHolidayHours: "0", travel: null, financialSnapshot: null, notes: null, managerNotes: null, status: "PENDING_APPROVAL", submittedAt: null, approvedAt: null, rejectedAt: null, rejectionReason: null, createdAt: "2026-08-01T00:00:00", updatedAt: "2026-08-01T00:00:00" };
afterEach(() => vi.restoreAllMocks()); const respond = (body: unknown) => vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify(body), { status: 200, headers: { "Content-Type": "application/json" } }));
describe("work-log API and keys", () => {
  it("uses company-scoped list/detail query keys", () => { expect(queryKeys.workLogs(7)).toEqual(["company", 7, "work-logs"]); expect(queryKeys.workLog(7, 1)).toEqual(["company", 7, "work-logs", 1]); expect(queryKeys.workLog(8, 1)).not.toEqual(queryKeys.workLog(7, 1)); });
  it("uses worker endpoint when filtering by worker", async () => { respond([log]); await getWorkLogs("APPROVED", 2); expect(fetch).toHaveBeenCalledWith("/api/backend/work-logs/worker/2?status=APPROVED", expect.any(Object)); });
  it("uses company-context list and detail routes", async () => { respond([log]); await getWorkLogs(); expect(fetch).toHaveBeenCalledWith("/api/backend/work-logs", expect.any(Object)); vi.restoreAllMocks(); respond(log); await getWorkLog(1); expect(fetch).toHaveBeenCalledWith("/api/backend/work-logs/1", expect.any(Object)); });
  it("sends rejection reason only to the reject action", async () => { respond(log); await rejectWorkLog(1, "Missing approval"); expect(fetch).toHaveBeenCalledWith("/api/backend/work-logs/1/reject", expect.objectContaining({ method: "PATCH", body: JSON.stringify({ rejectionReason: "Missing approval" }) })); });
  it("rejects negative hours and break minutes client-side", () => { const result = workLogInputSchema.safeParse({ workerProfileId: 2, projectPositionId: 4, workDate: "2026-08-01", unpaidBreakMinutes: -1, regularHours: "-1", overtime15Hours: "0", overtime20Hours: "0", saturdayHours: "0", sundayHours: "0", publicHolidayHours: "0", travelHours: "0", kilometres: "0", lafhaNights: 0, notes: "" }); expect(result.success).toBe(false); });
});
