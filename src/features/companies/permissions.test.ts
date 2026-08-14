import { describe, expect, it } from "vitest";
import { can } from "@/lib/permissions";

describe("company management permission", () => {
  it.each(["OWNER", "ADMIN"] as const)("allows authorised %s users", (role) => {
    expect(can(role, "company:manage")).toBe(true);
  });

  it.each(["MANAGER", "FINANCE", "WORKER"] as const)("hides management actions from %s users", (role) => {
    expect(can(role, "company:manage")).toBe(false);
  });
});
