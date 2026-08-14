import { describe, expect, it } from "vitest";
import { positionResponseSchema, positionSchema } from "./schemas";

describe("position schemas", () => {
  it("coerces the project id and trims the position name", () => {
    expect(positionSchema.parse({ projectId: "5", positionName: "  Installer  " })).toEqual({ projectId: 5, positionName: "Installer" });
  });

  it("enforces project and backend name constraints", () => {
    expect(positionSchema.safeParse({ projectId: "", positionName: "Installer" }).success).toBe(false);
    expect(positionSchema.safeParse({ projectId: 5, positionName: "x".repeat(101) }).success).toBe(false);
  });

  it("requires company and project identity in responses", () => {
    expect(positionResponseSchema.safeParse({ id: 1, positionName: "Installer", active: true }).success).toBe(false);
  });
});
