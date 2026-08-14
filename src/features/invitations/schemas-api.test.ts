import { afterEach, describe, expect, it, vi } from "vitest";
import { cancelInvitation, createInvitation, getInvitations } from "./api";
import { invitationInputSchema } from "./schemas";
const invitation = { id: 3, companyId: 7, companyName: "Acme", name: "Alex", surname: "Worker", email: "alex@example.com", role: "WORKER", status: "PENDING", invitedByUserId: 1, invitedByName: "Owner", expiresAt: "2026-09-01T00:00:00", acceptedAt: null, cancelledAt: null, createdAt: "2026-08-01T00:00:00", updatedAt: "2026-08-01T00:00:00" };
afterEach(() => vi.restoreAllMocks()); const respond = (body: unknown, status = 200) => vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } }));
describe("invitations", () => {
  it("accepts a WORKER invitation with a valid email", () => expect(invitationInputSchema.safeParse({ name: "A", surname: "W", email: "a@example.com", role: "WORKER" }).success).toBe(true));
  it.each(["OWNER", "ADMIN", "MANAGER", "FINANCE"])("rejects backend-unsupported %s invitations", (role) => expect(invitationInputSchema.safeParse({ name: "A", surname: "W", email: "a@example.com", role }).success).toBe(false));
  it("rejects an invalid invitation email", () => expect(invitationInputSchema.safeParse({ name: "A", surname: "W", email: "bad", role: "WORKER" }).success).toBe(false));
  it("uses company-scoped filtered list", async () => { respond([invitation]); await getInvitations(7, "PENDING"); expect(fetch).toHaveBeenCalledWith("/api/backend/companies/7/invitations?status=PENDING", expect.any(Object)); });
  it("sends exact invitation payload", async () => { respond({ invitation, invitationUrl: "https://example.com/i" }, 201); const data = { name: "Alex", surname: "Worker", email: "alex@example.com", role: "WORKER" as const }; await createInvitation(7, data); expect(fetch).toHaveBeenCalledWith("/api/backend/companies/7/invitations", expect.objectContaining({ method: "POST", body: JSON.stringify(data) })); });
  it("uses cancellation lifecycle endpoint", async () => { respond({ ...invitation, status: "CANCELLED" }); await cancelInvitation(7, 3); expect(fetch).toHaveBeenCalledWith("/api/backend/companies/7/invitations/3/cancel", expect.objectContaining({ method: "PATCH" })); });
});
