import { describe, expect, it } from "vitest";
import { profileInputSchema, workerSchema, workerSummarySchema } from "./schemas";

const input = { abn: "12 345 678 901", gstRegistered: true, phone: "0400000000", bankDetails: { bankName: "Bank", accountName: "A Worker", bsb: "123-456", accountNumber: "12345678" }, superDetails: { fundName: "Fund", usi: "USI", memberNumber: "M1" }, notes: "Note" };

describe("worker schemas", () => {
  it("accepts formatted ABN and BSB values", () => expect(profileInputSchema.safeParse(input).success).toBe(true));
  it.each([["123", "123-456", "12345678"], ["12345678901", "12", "12345678"], ["12345678901", "123456", "123"]])("rejects invalid ABN/BSB/account combinations", (abn, bsb, accountNumber) => expect(profileInputSchema.safeParse({ ...input, abn, bankDetails: { ...input.bankDetails, bsb, accountNumber } }).success).toBe(false));
  it("allows blank optional profile values", () => expect(profileInputSchema.safeParse({ ...input, abn: "", phone: "", bankDetails: { bankName: "", accountName: "", bsb: "", accountNumber: "" }, superDetails: { fundName: "", usi: "", memberNumber: "" }, notes: "" }).success).toBe(true));
  it("rejects unknown statuses and incomplete private responses", () => {
    expect(workerSummarySchema.safeParse({ workerProfileId: 1, appUserId: 2, fullName: "A", email: "a@b.com", phone: null, abn: null, gstRegistered: false, status: "ACTIVE", membershipStatus: "ACTIVE", profileComplete: false }).success).toBe(false);
    expect(workerSchema.safeParse({ id: 1 }).success).toBe(false);
  });
  it("requires worker membership identity and forbids privileged roles in worker responses", () => {
    const summary = { workerProfileId: 1, appUserId: 2, fullName: "A", email: "a@b.com", phone: null, abn: null, gstRegistered: false, status: "COMPLETE", membershipId: 12, membershipRole: "WORKER", membershipStatus: "ACTIVE", profileComplete: true };
    expect(workerSummarySchema.safeParse(summary).success).toBe(true);
    expect(workerSummarySchema.safeParse({ ...summary, membershipRole: "OWNER" }).success).toBe(false);
    expect(workerSummarySchema.safeParse({ ...summary, membershipId: undefined }).success).toBe(false);
  });
});
