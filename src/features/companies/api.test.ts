import { afterEach, describe, expect, it, vi } from "vitest";
import { createCompany, deactivateCompany, getCompany, updateCompany } from "./api";

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

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

afterEach(() => vi.restoreAllMocks());

describe("companies API", () => {
  it("loads a company through the BFF", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(jsonResponse(company));

    await expect(getCompany(7)).resolves.toEqual(company);
    expect(fetchMock).toHaveBeenCalledWith("/api/backend/companies/7", expect.objectContaining({
      headers: expect.objectContaining({ Accept: "application/json" }),
    }));
  });

  it.each([
    ["create", createCompany, "/api/backend/companies", "POST"],
    ["update", (input: Parameters<typeof updateCompany>[1]) => updateCompany(7, input), "/api/backend/companies/7", "PUT"],
  ] as const)("sends a contract-valid payload on %s", async (_name, operation, path, method) => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(jsonResponse(company));
    const input = {
      name: " Acme Labour ",
      abn: "12 345 678 901",
      email: "accounts@acme.test",
      phone: "",
      address: "",
      active: false,
      contractorInvoiceGstEnabled: true,
    };

    await operation(input);

    expect(fetchMock).toHaveBeenCalledWith(path, expect.objectContaining({
      method,
      body: JSON.stringify({
        name: "Acme Labour",
        abn: "12 345 678 901",
        email: "accounts@acme.test",
        phone: null,
        address: null,
        active: false,
        contractorInvoiceGstEnabled: true,
      }),
    }));
  });

  it("uses DELETE and accepts the backend's empty response", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(null, { status: 204 }));

    await expect(deactivateCompany(7)).resolves.toBeUndefined();
    expect(fetchMock).toHaveBeenCalledWith("/api/backend/companies/7", expect.objectContaining({ method: "DELETE" }));
  });

  it("rejects a response that does not follow the nominal DTO", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(jsonResponse({ ...company, active: "true" }));
    await expect(getCompany(7)).rejects.toThrow();
  });
});
