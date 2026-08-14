import { describe, expect, it } from "vitest";
import { queryKeys } from "@/lib/api/query-keys";
import { can } from "@/lib/permissions";

describe("rate scoping and permissions", () => {
  it("isolates list and detail keys by active company", () => {
    expect(queryKeys.rates(7)).toEqual(["company", 7, "rates"]);
    expect(queryKeys.rate(7, 4)).toEqual(["company", 7, "rates", 4]);
    expect(queryKeys.rate(8, 4)).not.toEqual(queryKeys.rate(7, 4));
  });

  it.each(["OWNER", "ADMIN", "MANAGER"] as const)("allows %s to manage rates", (role) => expect(can(role, "rates:manage")).toBe(true));
  it.each(["FINANCE", "WORKER"] as const)("denies %s rate management", (role) => expect(can(role, "rates:manage")).toBe(false));
});
