import { describe, expect, it } from "vitest";
import { safeInternalPath } from "./redirect";

describe("safeInternalPath", () => {
  it.each([
    [null, "/dashboard"],
    ["", "/dashboard"],
    ["https://attacker.example/phish", "/dashboard"],
    ["//attacker.example/phish", "/dashboard"],
    ["/\\attacker.example/phish", "/dashboard"],
    ["javascript:alert(1)", "/dashboard"],
  ])("maps %s to a safe fallback", (candidate, expected) => {
    expect(safeInternalPath(candidate)).toBe(expected);
  });

  it.each([
    ["/invoices", "/invoices"],
    ["/work-logs?status=PENDING#top", "/work-logs?status=PENDING#top"],
  ])("keeps internal path %s", (candidate, expected) => {
    expect(safeInternalPath(candidate)).toBe(expected);
  });

  it("supports a caller-provided safe fallback", () => {
    expect(safeInternalPath("https://attacker.example", "/login")).toBe("/login");
  });
});
