import { ApiError, toApiError } from "@/lib/api/error";
import { platformCompanySchema, type PlatformCompanyInput } from "./schemas";

async function request(path: string, init?: RequestInit): Promise<unknown> {
  let response: Response;
  try {
    response = await fetch(`/api/backend${path}`, {
      ...init,
      headers: { Accept: "application/json", ...(init?.body ? { "Content-Type": "application/json" } : {}), ...init?.headers },
    });
  } catch { throw new ApiError(503, "Could not connect to the server."); }
  if (response.status === 401) throw new ApiError(401, "Your session has expired.");
  if (!response.ok) throw await toApiError(response);
  return response.status === 204 ? undefined : response.json();
}

export async function listPlatformCompanies(): Promise<unknown[]> {
  return (await request("/platform/companies")) as unknown[];
}

export async function provisionPlatformCompany(input: PlatformCompanyInput): Promise<unknown> {
  const payload = platformCompanySchema.parse(input);
  const temporaryPassword = payload.temporaryPassword?.trim() || undefined;
  return request("/platform/companies", {
    method: "POST",
    body: JSON.stringify({
      company: {
        name: payload.name, abn: payload.abn, email: payload.email,
        phone: payload.phone || null, address: payload.address || null,
        contractorInvoiceGstEnabled: payload.contractorInvoiceGstEnabled,
        active: payload.active,
      },
      owner: {
        firstName: payload.ownerFirstName, lastName: payload.ownerLastName,
        email: payload.ownerEmail, ...(temporaryPassword ? { temporaryPassword } : {}),
      },
    }),
  });
}

export async function setPlatformCompanyActive(companyId: number, active: boolean): Promise<unknown> {
  return request(`/platform/companies/${companyId}/active?active=${active}`, { method: "PATCH" });
}
