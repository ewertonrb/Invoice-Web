import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";
import {
  clearCompanyScopedCache,
  isCompanyScopedQueryKey,
  queryKeys,
} from "./query-keys";

describe("company-scoped query keys", () => {
  it("includes the company ID in every operational key", () => {
    const operationalKeys = [
      queryKeys.projects(41),
      queryKeys.positions(41),
      queryKeys.rates(41),
      queryKeys.workers(41),
      queryKeys.workLogs(41),
      queryKeys.invoices(41),
      queryKeys.dashboard.summary(41),
    ];

    expect(operationalKeys).toEqual([
      ["company", 41, "projects"],
      ["company", 41, "positions"],
      ["company", 41, "rates"],
      ["company", 41, "workers"],
      ["company", 41, "work-logs"],
      ["company", 41, "invoices"],
      ["company", 41, "dashboard", "summary"],
    ]);
    expect(operationalKeys.every(isCompanyScopedQueryKey)).toBe(true);
  });

  it("keeps data for different companies isolated", () => {
    expect(queryKeys.invoices(1)).not.toEqual(queryKeys.invoices(2));
  });

  it("scopes project detail by company and project", () => {
    expect(queryKeys.project(7, 3)).toEqual(["company", 7, "projects", 3]);
    expect(queryKeys.project(7, 3)).not.toEqual(queryKeys.project(8, 3));
  });

  it("scopes position detail by company and position", () => {
    expect(queryKeys.position(7, 9)).toEqual(["company", 7, "positions", 9]);
    expect(queryKeys.position(7, 9)).not.toEqual(queryKeys.position(8, 9));
  });

  it("cancels and removes company-scoped data while retaining global data", async () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(queryKeys.session, { userId: 1 });
    queryClient.setQueryData(queryKeys.companies, [{ companyId: 1 }]);
    queryClient.setQueryData(queryKeys.projects(1), [{ id: 10 }]);
    queryClient.setQueryData(queryKeys.invoices(2), [{ id: 20 }]);

    await clearCompanyScopedCache(queryClient);

    expect(queryClient.getQueryData(queryKeys.session)).toEqual({ userId: 1 });
    expect(queryClient.getQueryData(queryKeys.companies)).toEqual([{ companyId: 1 }]);
    expect(queryClient.getQueryData(queryKeys.projects(1))).toBeUndefined();
    expect(queryClient.getQueryData(queryKeys.invoices(2))).toBeUndefined();
  });
});
