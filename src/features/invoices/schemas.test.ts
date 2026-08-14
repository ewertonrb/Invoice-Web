import { describe, expect, it } from "vitest";
import { invoicePeriodPreviewSchema, invoiceSchema } from "./schemas";

describe("invoice contracts", () => {
  it("parses backend preview money values", () => {
    const result = invoicePeriodPreviewSchema.parse({ periodStart: "2026-08-01", periodEnd: "2026-08-31", workerCount: 1, readyWorkerCount: 1, blockedWorkerCount: 0, workLogCount: 2, subtotalAmount: "100.00", gstAmount: 10, totalAmount: 110, workers: [{ workerProfileId: 1, appUserId: 2, workerName: "Alex", workerEmail: "alex@example.com", workerAbn: null, gstRegistered: true, workLogCount: 2, subtotalAmount: 100, gstAmount: 10, totalAmount: 110, readyToGenerate: true, problems: [] }] });
    expect(result.totalAmount).toBe(110);
    expect(result.workers[0].subtotalAmount).toBe(100);
  });

  it("requires invoice line items to use the backend shape", () => {
    const result = invoiceSchema.safeParse({ id: 1, invoiceNumber: null, companyId: 1, companyName: "Acme", workerProfileId: 2, appUserId: 3, workerName: "Alex", workerEmail: "alex@example.com", workerAbn: null, workerGstRegistered: false, periodStart: "2026-08-01", periodEnd: "2026-08-31", issueDate: null, dueDate: null, subtotalAmount: 100, gstAmount: 0, totalAmount: 100, status: "DRAFT", notes: null, pdfPath: null, issuedAt: null, paidAt: null, cancelledAt: null, itemCount: 1, items: [{ id: 9, workLogId: 8, workDate: "2026-08-02", projectName: "Site", positionName: "Carpenter", description: "Hours", subtotalAmount: 100, gstAmount: 0, totalAmount: 100, createdAt: "2026-08-02T00:00:00", updatedAt: "2026-08-02T00:00:00" }], createdAt: "2026-08-02T00:00:00", updatedAt: "2026-08-02T00:00:00" });
    expect(result.success).toBe(true);
  });
});
