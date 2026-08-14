import { describe, expect, it } from "vitest";
import { projectResponseSchema, projectSchema } from "./schemas";

describe("project schemas", () => {
  it("trims the only backend-supported input", () => {
    expect(projectSchema.parse({ name: "  Harbour  " })).toEqual({ name: "Harbour" });
  });

  it("enforces backend name constraints", () => {
    expect(projectSchema.safeParse({ name: "" }).success).toBe(false);
    expect(projectSchema.safeParse({ name: "x".repeat(101) }).success).toBe(false);
  });

  it("rejects a response without company scope", () => {
    expect(projectResponseSchema.safeParse({ id: 1, name: "A", active: true }).success).toBe(false);
  });
});
