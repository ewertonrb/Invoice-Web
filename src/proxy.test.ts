import { describe, expect, it } from "vitest";
import { config } from "./proxy";

describe("protected route matcher", () => {
  it("covers every protected SRS route", () => {
    expect(config.matcher).toEqual(expect.arrayContaining([
      "/dashboard/:path*",
      "/select-company",
      "/companies/:path*",
      "/projects/:path*",
      "/positions/:path*",
      "/rates/:path*",
      "/workers/:path*",
      "/work-logs/:path*",
      "/invoices/:path*",
      "/settings/:path*",
    ]));
  });

  it("keeps login and session-cleanup routes outside authentication proxying", () => {
    expect(config.matcher).not.toContain("/login");
    expect(config.matcher).not.toContain("/api/auth/clear-session");
    expect(config.matcher.every((matcher) => !matcher.startsWith("/api/"))).toBe(true);
  });
});
