import { afterEach, describe, expect, it, vi } from "vitest";
import { getDashboardSummary } from "./api";
import { queryKeys } from "@/lib/api/query-keys";

afterEach(() => vi.restoreAllMocks());

describe("dashboard summary", () => {
  it("uses the dashboard summary endpoint and parses currency", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({ pendingReview: 2, readyToInvoice: 3, draftInvoices: 2, outstandingAmount: "800.00", availableShifts: 0, myShifts: 0 }), { status: 200 }));
    await expect(getDashboardSummary()).resolves.toEqual({ pendingReview: 2, readyToInvoice: 3, draftInvoices: 2, outstandingAmount: 800, availableShifts: 0, myShifts: 0 });
    expect(fetch).toHaveBeenCalledWith("/api/backend/dashboard/summary", expect.any(Object));
  });

  it("has a distinct company-scoped summary key", () => {
    expect(queryKeys.dashboard.summary(1)).toEqual(["company", 1, "dashboard", "summary"]);
    expect(queryKeys.dashboard.summary(1)).not.toEqual(queryKeys.dashboard.summary(2));
  });

  it("accepts an older backend response while the backend is being rebuilt", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({ pendingReview: 2, readyToInvoice: 3, draftInvoices: 1, outstandingAmount: "250.00" }), { status: 200 }));
    await expect(getDashboardSummary()).resolves.toEqual({ pendingReview: 2, readyToInvoice: 3, draftInvoices: 1, outstandingAmount: 250, availableShifts: 0, myShifts: 0 });
  });
});
