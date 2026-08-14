import { afterEach, describe, expect, it, vi } from "vitest";
import { createJoinLink, disableJoinLink, getJoinLinks } from "./api";
import { joinLinkInputSchema, joinLinkSchema } from "./schemas";
import { queryKeys } from "@/lib/api/query-keys";

const future = new Date(Date.now() + 86_400_000).toISOString();
const link = { id: 4, companyId: 7, companyName: "Acme", role: "WORKER", status: "ACTIVE", maxUses: 5, currentUses: 1, remainingUses: 4, expiresAt: future, disabledAt: null, createdByUserId: 1, createdByName: "Owner", createdAt: "2026-08-01T00:00:00", updatedAt: "2026-08-01T00:00:00" };
afterEach(() => vi.restoreAllMocks());
const respond = (body: unknown, status = 200) => vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } }));

describe("public join-link admin contract", () => {
  it("requires WORKER, positive quota, and future expiry", () => { expect(joinLinkInputSchema.safeParse({ role: "WORKER", maxUses: 1, expiresAt: future }).success).toBe(true); expect(joinLinkInputSchema.safeParse({ role: "MANAGER", maxUses: 1, expiresAt: future }).success).toBe(false); expect(joinLinkInputSchema.safeParse({ role: "WORKER", maxUses: 0, expiresAt: future }).success).toBe(false); expect(joinLinkInputSchema.safeParse({ role: "WORKER", maxUses: 1, expiresAt: "" }).success).toBe(false); expect(joinLinkInputSchema.safeParse({ role: "WORKER", maxUses: 1, expiresAt: "2020-01-01T00:00:00Z" }).success).toBe(false); });
  it("requires quota and expiry in responses", () => { expect(joinLinkSchema.safeParse(link).success).toBe(true); expect(joinLinkSchema.safeParse({ ...link, maxUses: undefined }).success).toBe(false); expect(joinLinkSchema.safeParse({ ...link, expiresAt: undefined }).success).toBe(false); });
  it("uses company-scoped admin routes and keys", async () => { expect([...queryKeys.invitations(7), "public"]).toEqual(["company", 7, "invitations", "public"]); respond([link]); await getJoinLinks(7); expect(fetch).toHaveBeenCalledWith("/api/backend/companies/7/join-links", expect.any(Object)); });
  it("creates with exact quota/expiry and WORKER role", async () => { respond({ joinLink: link, joinUrl: "https://invoice.example/join/x" }, 201); await createJoinLink(7, { role: "WORKER", maxUses: 5, expiresAt: future }); expect(fetch).toHaveBeenCalledWith("/api/backend/companies/7/join-links", expect.objectContaining({ method: "POST", body: JSON.stringify({ role: "WORKER", maxUses: 5, expiresAt: future }) })); });
  it("uses company-scoped disable endpoint", async () => { respond({ ...link, status: "DISABLED" }); await disableJoinLink(7, 4); expect(fetch).toHaveBeenCalledWith("/api/backend/companies/7/join-links/4/disable", expect.objectContaining({ method: "PATCH" })); });
});
