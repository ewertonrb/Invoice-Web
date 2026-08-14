import type { PropsWithChildren } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { queryKeys } from "@/lib/api/query-keys";
import { useCompany, useUpdateCompany } from "./hooks";
import * as api from "./api";

vi.mock("./api", () => ({
  createCompany: vi.fn(),
  deactivateCompany: vi.fn(),
  getCompany: vi.fn(),
  updateCompany: vi.fn(),
}));

const company = {
  id: 7,
  name: "Acme Labour",
  abn: "12 345 678 901",
  email: "accounts@acme.test",
  phone: null,
  address: null,
  active: true,
  contractorInvoiceGstEnabled: false,
  createdAt: "2026-08-06T09:00:00",
  updatedAt: "2026-08-06T10:00:00",
};

function setup() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  const wrapper = ({ children }: PropsWithChildren) => <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  return { client, wrapper };
}

beforeEach(() => vi.clearAllMocks());

describe("company hooks", () => {
  it("loads and caches company data under the company-scoped key", async () => {
    vi.mocked(api.getCompany).mockResolvedValue(company);
    const { client, wrapper } = setup();

    const { result } = renderHook(() => useCompany(7), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(api.getCompany).toHaveBeenCalledWith(7);
    expect(client.getQueryData(queryKeys.company(7))).toEqual(company);
    expect(client.getQueryData(queryKeys.company(8))).toBeUndefined();
  });

  it("does not request a company without a valid company context", () => {
    const { wrapper } = setup();
    const { result } = renderHook(() => useCompany(0), { wrapper });

    expect(result.current.fetchStatus).toBe("idle");
    expect(api.getCompany).not.toHaveBeenCalled();
  });

  it("updates only the matching company-scoped cache entry", async () => {
    const updated = { ...company, name: "Acme Group" };
    vi.mocked(api.updateCompany).mockResolvedValue(updated);
    const { client, wrapper } = setup();
    client.setQueryData(queryKeys.company(7), company);
    client.setQueryData(queryKeys.company(8), { ...company, id: 8, name: "Other" });

    const { result } = renderHook(() => useUpdateCompany(7), { wrapper });
    await act(async () => {
      await result.current.mutateAsync({
        name: "Acme Group",
        abn: company.abn,
        email: company.email,
        phone: company.phone ?? undefined,
        address: company.address ?? undefined,
        active: company.active,
        contractorInvoiceGstEnabled: company.contractorInvoiceGstEnabled,
      });
    });

    expect(client.getQueryData(queryKeys.company(7))).toEqual(updated);
    expect(client.getQueryData<{ name: string }>(queryKeys.company(8))?.name).toBe("Other");
  });
});
