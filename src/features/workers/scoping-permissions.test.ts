import { describe, expect, it } from "vitest";
import { queryKeys } from "@/lib/api/query-keys";
import { can } from "@/lib/permissions";

describe("workers scoping and permissions", () => {
  it("includes company in every worker key", () => { expect(queryKeys.workers(7)).toEqual(["company", 7, "workers"]); expect(queryKeys.worker(7, 2)).toEqual(["company", 7, "workers", 2]); expect(queryKeys.workerProfile(7)).toEqual(["company", 7, "worker-profile"]); });
  it("scopes membership invalidation to company", () => { expect(queryKeys.memberships(7)).toEqual(["company", 7, "memberships"]); expect(queryKeys.memberships(8)).not.toEqual(queryKeys.memberships(7)); });
  it.each(["OWNER", "ADMIN", "MANAGER"] as const)("allows %s to manage workers", (role) => expect(can(role, "workers:manage")).toBe(true));
  it.each(["FINANCE", "WORKER"] as const)("denies %s worker administration", (role) => expect(can(role, "workers:manage")).toBe(false));
  it("reserves own profile permission for WORKER", () => { expect(can("WORKER", "profile:own")).toBe(true); expect(can("OWNER", "profile:own")).toBe(false); });
});
