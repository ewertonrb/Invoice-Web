import { describe, expect, it } from "vitest";
import { can } from "./index";

describe("invoice permissions", () => {
  it("allows finance users to view invoices without management actions", () => {
    expect(can("FINANCE", "invoices:view")).toBe(true);
    expect(can("FINANCE", "invoices:manage")).toBe(false);
  });

  it.each(["OWNER", "MANAGER"] as const)("allows %s to manage invoices", (role) => {
    expect(can(role, "invoices:view")).toBe(true);
    expect(can(role, "invoices:manage")).toBe(true);
  });

  it.each(["WORKER"] as const)("allows %s to view but not manage invoices", (role) => {
    expect(can(role, "invoices:view")).toBe(true);
    expect(can(role, "invoices:manage")).toBe(false);
  });

  it("allows admins to manage invoices", () => {
    expect(can("ADMIN", "invoices:view")).toBe(true);
    expect(can("ADMIN", "invoices:manage")).toBe(true);
  });
});
